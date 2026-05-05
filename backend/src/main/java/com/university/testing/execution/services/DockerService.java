package com.university.testing.execution.services;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class DockerService {
    private static final Logger log = LoggerFactory.getLogger(DockerService.class);
    private final DockerClient dockerClient;

    public DockerService() {
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost("npipe:////./pipe/docker_engine")
                .build();

        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .build();

        this.dockerClient = DockerClientImpl.getInstance(config, httpClient);
        log.info("Docker Client успешно инициализирован.");
    }

    public String runCode(String code, String language) {
        String imageName = "sandbox-" + language;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        log.info("Запуск кода на языке: {} в контейнере {}", language, imageName);

        try {
            CreateContainerResponse container = dockerClient.createContainerCmd(imageName)
                    .withCmd("sh", "-c", "echo \"" + code + "\" > solution.py && python3 solution.py")
                    .withHostConfig(HostConfig.newHostConfig().withMemory(128 * 1024 * 1024L))
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
                            try { outputStream.write(object.getPayload()); } catch (Exception e) { log.error("Ошибка чтения логов", e); }
                        }
                    }).awaitCompletion();

            dockerClient.removeContainerCmd(container.getId()).exec();

            String result = outputStream.toString();
            log.info("Код выполнен успешно. Результат: {}", result);
            return result;

        } catch (Exception e) {
            log.error("Критическая ошибка при выполнении кода: {}", e.getMessage(), e);
            return "Ошибка выполнения: " + e.getMessage();
        }
    }
}