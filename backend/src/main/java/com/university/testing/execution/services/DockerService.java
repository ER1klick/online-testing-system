package com.university.testing.execution.services;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;

@Service
public class DockerService {
    private final DockerClient dockerClient;

    public DockerService() {
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("tcp://localhost:2375")
                .build();

        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .build();

        this.dockerClient = DockerClientImpl.getInstance(config, httpClient);

        System.out.println("--- DOCKER CLIENT ИНИЦИАЛИЗИРОВАН ---");
    }

    public String runCode(String code, String language) {
        String imageName = "sandbox-" + language;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            var container = dockerClient.createContainerCmd(imageName)
                    .withCmd("sh", "-c", "echo \"" + code + "\" > solution.py && python3 solution.py")
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
                            try { outputStream.write(object.getPayload()); } catch (Exception e) { e.printStackTrace(); }
                        }
                    }).awaitCompletion();

            dockerClient.removeContainerCmd(container.getId()).exec();
            return outputStream.toString();

        } catch (Exception e) {
            return "Ошибка выполнения: " + e.getMessage();
        }
    }
}