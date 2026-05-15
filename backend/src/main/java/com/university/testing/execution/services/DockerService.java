package com.university.testing.execution.services;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.university.testing.result.services.ResultService;
import com.university.testing.shared.dtos.ExecutionTaskDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

@Service
public class DockerService {
    private static final Logger log = LoggerFactory.getLogger(DockerService.class);
    private final DockerClient dockerClient;
    private final ResultService resultService;

    public DockerService(ResultService resultService) {
        this.resultService = resultService;
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("npipe:////./pipe/docker_engine")
                .build();

        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .build();

        this.dockerClient = DockerClientImpl.getInstance(config, httpClient);
    }

    public void runContainer(ExecutionTaskDto task) {
        String output = runCode(task.getCode(), task.getLanguage());
        resultService.saveResult(task.getSubmissionId(), task.getQuestionId(), output);
    }

    public String runCode(String code, String language) {
        String imageName = "sandbox-" + language.toLowerCase();
        String formattedCode = code.replace("\\n", "\n");
        String escapedCode = formattedCode.replace("\"", "\\\"");

        String cmd = switch (language.toLowerCase()) {
            case "python" -> "printf '%s' \"" + escapedCode + "\" > solution.py && python3 solution.py";
            case "java"   -> "printf '%s' \"" + escapedCode + "\" > Solution.java && javac Solution.java && java Solution";
            case "cpp"    -> "printf '%s' \"" + escapedCode + "\" > solution.cpp && g++ solution.cpp -o app && ./app";
            case "csharp" -> "dotnet new console -n App --force > /dev/null && " +
                    "printf '%s' \"" + escapedCode + "\" > App/Program.cs && " +
                    "dotnet build App/App.csproj --configuration Release --nologo --verbosity quiet > /dev/null && " +
                    "dotnet App/bin/Release/net8.0/App.dll";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };

        log.info("Starting execution container for language: {}", language);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            CreateContainerResponse container = dockerClient.createContainerCmd(imageName)
                    .withCmd("sh", "-c", cmd)
                    .withHostConfig(HostConfig.newHostConfig()
                            .withMemory(128 * 1024 * 1024L)
                            .withNetworkMode("none"))
                    .exec();

            dockerClient.startContainerCmd(container.getId()).exec();
            dockerClient.waitContainerCmd(container.getId())
                    .exec(new com.github.dockerjava.core.command.WaitContainerResultCallback())
                    .awaitCompletion();

            dockerClient.logContainerCmd(container.getId())
                    .withStdOut(true)
                    .withStdErr(true)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Frame object) {
                            try { outputStream.write(object.getPayload()); } catch (Exception e) { log.error("Log error", e); }
                        }
                    }).awaitCompletion();

            dockerClient.removeContainerCmd(container.getId()).exec();
            return outputStream.toString();

        } catch (Exception e) {
            log.error("Execution error: {}", e.getMessage());
            return "Execution error: " + e.getMessage();
        }
    }
}