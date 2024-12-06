# Curiosity Report: Docker vs. Kubernetes

## Introduction

During my summer internship as a Data Platforms Engineer Intern at Dexcom's DevOps team in San Diego, I had the opportunity to work with both Docker and Kubernetes. While building a service called Kafka Concierge, I first tested the service using Docker and later deployed it in a Kubernetes cluster managed by my team. This experience exposed me to the capabilities and differences of these two tools, but I wanted to explore their differences more deeply to understand how they complement each other in modern DevOps practices.

This report dives into the differences between Docker and Kubernetes, using my internship experience as a practical case study.

---

## Key Differences Between Docker and Kubernetes

Docker and Kubernetes are two critical technologies in modern containerization and orchestration. Here’s a breakdown of their purposes and key distinctions:

### 1. **Primary Purpose**

- **Docker**: A platform for building, running, and sharing containers. It focuses on containerizing applications and their dependencies to ensure consistency across environments.
- **Kubernetes**: An orchestration tool for managing multiple containers at scale. It automates tasks like deployment, scaling, and load balancing across clusters of containers.

### 2. **Scope**

- **Docker**: Works at the individual container level. It’s excellent for developing and testing applications locally.
- **Kubernetes**: Manages containerized applications across multiple hosts. It handles networking, storage, and configurations for an entire ecosystem of containers.

### 3. **Networking**

- **Docker**: Provides simple networking solutions for containers to communicate within a single host.
- **Kubernetes**: Offers a more complex networking model, enabling communication between containers across multiple hosts using service discovery and DNS.

### 4. **Scaling**

- **Docker**: Scaling containers requires manual scripting or external tools.
- **Kubernetes**: Built-in auto-scaling capabilities make it easier to manage dynamic workloads.

### 5. **Ecosystem**

- **Docker**: Focuses on development and lightweight container management.
- **Kubernetes**: Integrates with various tools (e.g., Helm, Prometheus) to provide a complete ecosystem for running applications in production environments.

---

## Connection to My Internship at Dexcom

At Dexcom, Kubernetes was crucial for managing various environments across the company. My Kafka Concierge service, which enabled employees to create Kafka instances with customized parameters, began as a Dockerized application. Testing with Docker allowed me to ensure the service worked as expected on a single machine.

However, running the service in a Kubernetes cluster unlocked its full potential. Here’s why Kubernetes was ideal for this scenario:

- **Scalability**: Multiple Kafka Concierge instances could be deployed to meet demand.
- **Reliability**: Kubernetes ensured high availability through its self-healing capabilities.
- **Integration**: Kubernetes allowed seamless integration with other services in Dexcom's infrastructure.

While I gained hands-on experience deploying the service, I realized I had limited understanding of the inner workings of Kubernetes. For example, I learned Kubernetes uses concepts like pods, services, and ingress controllers but didn’t have time to explore their configurations deeply. Writing this report has helped fill those gaps.

---

## What I Learned

Through this research, I learned that Docker and Kubernetes are not competitors but complementary tools. Docker excels in containerization, while Kubernetes specializes in orchestration at scale. Here are some additional insights:

- Kubernetes heavily relies on Docker or other container runtimes to operate.
- Using Kubernetes effectively requires understanding key concepts like nodes, pods, and namespaces.
- Dexcom’s use of Kubernetes clusters enabled the DevOps team to standardize deployments and improve efficiency across teams.

---

## Conclusion

Understanding the differences between Docker and Kubernetes has deepened my appreciation for their roles in modern DevOps. My internship experience gave me a practical introduction to these technologies, but this report has expanded my theoretical knowledge. As I continue to explore tools like Kubernetes, I look forward to leveraging this curiosity-driven learning in future roles.
