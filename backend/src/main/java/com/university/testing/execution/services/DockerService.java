package com.university.testing.execution.services;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.HostConfig;
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
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .build();
        this.dockerClient = DockerClientImpl.getInstance(config, httpClient);
    }

    public void runCode(String code, String language) {
        String imageName = "sandbox-" + language;

        HostConfig hostConfig = HostConfig.newHostConfig()
                .withMemory(128 * 1024 * 1024L)
                .withNetworkMode("none")
                .withPrivileged(false)
                .withAutoRemove(true);

        try {
            CreateContainerResponse container = dockerClient.createContainerCmd(imageName)
                    .withCmd("sh", "-c", "echo \"" + code + "\" > solution.py && python3 solution.py")
                    .withHostConfig(HostConfig.newHostConfig().withMemory(128 * 1024 * 1024L))
                    .exec();

            dockerClient.startContainerCmd(container.getId()).exec();

            dockerClient.waitContainerCmd(container.getId())
                    .exec(new com.github.dockerjava.core.command.WaitContainerResultCallback())
                    .awaitCompletion();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            dockerClient.logContainerCmd(container.getId())
                    .withStdOut(true)
                    .withStdErr(true)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Frame object) {
                            try { outputStream.write(object.getPayload()); } catch (Exception e) { e.printStackTrace(); }
                        }
                    }).awaitCompletion();

            System.out.println("Результат выполнения: " + outputStream.toString());

            dockerClient.removeContainerCmd(container.getId()).exec();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Выполнение было прервано: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Ошибка при работе с Docker: " + e.getMessage());
        }
    }
}