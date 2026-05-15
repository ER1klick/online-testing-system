package com.university.testing.execution.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String QUEUE = "execution_queue";
    public static final String EXCHANGE = "execution_exchange";
    public static final String ROUTING_KEY = "execution_routing_key";

    @Bean
    public Queue executionQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public TopicExchange executionExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding executionBinding(Queue executionQueue, TopicExchange executionExchange) {
        return BindingBuilder.bind(executionQueue).to(executionExchange).with(ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}