package com.university.testing.execution.services;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.apis.BatchV1Api;
import io.kubernetes.client.openapi.models.*;
import io.kubernetes.client.util.Config;
import org.springframework.stereotype.Service;

@Service
public class KubernetesService {

    public void runJob(String code, String language) throws Exception {
        ApiClient client = Config.defaultClient();
        Configuration.setDefaultApiClient(client);
        BatchV1Api api = new BatchV1Api();

        V1Job job = new V1Job()
                .apiVersion("batch/v1")
                .kind("Job")
                .metadata(new V1ObjectMeta().name("job-" + System.currentTimeMillis()))
                .spec(new V1JobSpec().template(new V1PodTemplateSpec()
                        .spec(new V1PodSpec()
                                .restartPolicy("Never")
                                .containers(java.util.List.of(new V1Container()
                                        .name("sandbox")
                                        .image("er14l/sandbox-python")
                                        .imagePullPolicy("Always")
                                        .command(java.util.List.of("python3", "-c", code))

                                ))
                        )
                ));

        api.createNamespacedJob("default", job)
                .execute();

        System.out.println("Job отправлена в Kubernetes!");
    }
}