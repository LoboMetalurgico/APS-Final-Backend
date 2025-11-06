# APS Final - EcoMobile

This repository contains the backend services for the APS Final project, code-named "EcoMobile".

This project consists of four main services:
1. **Geolocation Service**: Converts location names into geographical coordinates.
2. **Gateway Service**: Acts as the main entry point for client requests, routing them to the appropriate microservices.
3. **Weather Service**: Provides weather data based on geographical coordinates.
4. **Weather Metrics Service**: Offers additional weather-related metrics based on the data from the Weather Service.

## Services Overview
- Each service is built using TypeScript and leverages the ArunaCore framework for microservice communication.
- The services communicate with each other through defined actions and data structures.
- The Gateway Service handles incoming HTTP requests and coordinates responses from the other services.
- The Weather Service can accept either a location name or geographical coordinates to fetch weather data.
- The Weather Metrics Service provides supplementary weather metrics based on the coordinates provided by the Weather Service.

## Getting Started
To run the services locally, follow these steps:
1. Clone the repository to your local machine.
2. Navigate to each service directory and install the necessary dependencies using `npm install`.
3. Copy the `.env.example` file to `.env` in each service directory and configure the environment variables as needed.
4. Build each service using `npm run build`.
5. Start each service using `npm start`.

NOTE: Ensure that you have a running instance of the ArunaCore, as it is required for inter-service communication.
