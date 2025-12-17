# Chapter Templates & Standards

**Purpose**: Reusable templates and standards for AI-Native Textbook generation
**Created**: 2025-12-06
**Constitution Compliance**: Aligned with Technical Standards section of constitution v1.0.0

---

## 1. Docusaurus Frontmatter Template

Every chapter file MUST include this frontmatter at the top:

```markdown
---
id: chapter-X
title: "Chapter X: [Chapter Title]"
sidebar_label: "Chapter X"
sidebar_position: X
---
```

**Usage Example**:
```markdown
---
id: chapter-1
title: "Chapter 1: Introduction to Physical AI"
sidebar_label: "Chapter 1"
sidebar_position: 1
---
```

**Fields**:
- `id`: Unique identifier for Docusaurus routing (format: `chapter-X`)
- `title`: Full chapter title displayed on page
- `sidebar_label`: Short label for sidebar navigation
- `sidebar_position`: Numeric position in sidebar (1-8 for our chapters)

---

## 2. Learning Objectives Template

Every chapter MUST begin with a "Learning Objectives" section using Bloom's taxonomy verbs.

**Template**:
```markdown
## Learning Objectives

By the end of this chapter, you will be able to:

- **Understand**: [Explain/Describe/Define/Identify] [specific concept or principle]
- **Apply**: [Demonstrate/Implement/Execute/Use] [specific skill or technique]
- **Analyze**: [Compare/Contrast/Examine/Investigate] [relationships or components]
- **Evaluate**: [Assess/Critique/Judge/Justify] [design decisions or trade-offs]
- **Create**: [Design/Build/Develop/Construct] [complete system or solution]
```

**Bloom's Taxonomy Verbs by Level**:
- **Remember**: Define, List, Recall, Identify, Label, Name
- **Understand**: Explain, Describe, Summarize, Interpret, Classify
- **Apply**: Demonstrate, Implement, Execute, Use, Solve, Operate
- **Analyze**: Compare, Contrast, Examine, Investigate, Differentiate
- **Evaluate**: Assess, Critique, Judge, Justify, Recommend, Evaluate
- **Create**: Design, Build, Develop, Construct, Formulate, Devise

**Usage Example**:
```markdown
## Learning Objectives

By the end of this chapter, you will be able to:

- **Understand** the fundamental differences between digital AI and Physical AI
- **Identify** the key sensor types used in humanoid robotics (LIDAR, cameras, IMUs, force/torque sensors)
- **Explain** the perception-action-learning loop in embodied intelligence
- **Analyze** the current state and challenges of the humanoid robotics landscape
- **Apply** basic sensor data processing techniques using Python
```

---

## 3. Code Block Template

All code examples MUST include:
- Language identifier for syntax highlighting
- Explanatory comments within the code
- Context before and/or after the code block

**Template**:
```markdown
### [Code Example Title]

[Brief context explaining what this code does and when to use it]

```[language]
# [Comment explaining the purpose]
[code line 1]
[code line 2]

# [Comment explaining a key step or decision]
[code line 3]
[code line 4]
\```

**Key points**:
- [Bullet point explaining important aspect 1]
- [Bullet point explaining important aspect 2]
```

**Supported Languages**:
- `python` - Python code
- `bash` - Bash/shell scripts
- `xml` - XML files (URDF, SDF, launch files)
- `yaml` - YAML configuration files
- `cpp` - C++ code
- `csharp` - C# code (Unity)
- `json` - JSON configuration

**Usage Example**:
```markdown
### Basic Sensor Data Processing

This example demonstrates how to process IMU (Inertial Measurement Unit) data in Python, a common task in robotics for understanding robot orientation and motion.

\```python
import numpy as np

# IMU data structure: [accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z]
imu_data = np.array([0.1, 0.2, 9.8, 0.01, -0.02, 0.0])

# Extract accelerometer readings (m/s²)
acceleration = imu_data[:3]

# Extract gyroscope readings (rad/s)
angular_velocity = imu_data[3:]

# Calculate magnitude of acceleration
accel_magnitude = np.linalg.norm(acceleration)

print(f"Acceleration magnitude: {accel_magnitude:.2f} m/s²")
print(f"Angular velocity: {angular_velocity}")
\```

**Key points**:
- IMU sensors provide both linear acceleration and angular velocity
- Accelerometer data can be used to estimate orientation relative to gravity
- Gyroscope data tracks rotational movement
```

---

## 4. Diagram Placeholder Template

Diagrams can be included as:
1. **Mermaid diagrams** (preferred for flowcharts, sequence diagrams, architecture diagrams)
2. **Text descriptions** (placeholder for future visual diagrams)

### 4A. Mermaid Diagram Template

**Template for Flowchart**:
```markdown
### [Diagram Title]

[Brief description of what the diagram illustrates]

\```mermaid
flowchart [Direction]
    [Node1][Label 1]
    [Node2][Label 2]
    [Node1] --> [Node2]
\```

**Description**:
- [Explanation of key components]
```

**Template for Sequence Diagram**:
```markdown
### [Diagram Title]

[Brief description of the interaction flow]

\```mermaid
sequenceDiagram
    participant [A]
    participant [B]
    [A]->>[B]: [Message]
    [B]-->>[A]: [Response]
\```
```

**Usage Example**:
```markdown
### Perception-Action-Learning Loop

The perception-action-learning loop is the fundamental cycle of embodied intelligence in Physical AI systems.

\```mermaid
flowchart LR
    A[Perception<br/>Sensors] --> B[Cognition<br/>AI Model]
    B --> C[Action<br/>Actuators]
    C --> D[Environment]
    D --> A
    B --> E[Learning<br/>Update Model]
    E --> B
\```

**Description**:
- **Perception**: Robot gathers data from sensors (cameras, LIDAR, IMU)
- **Cognition**: AI processes sensor data and makes decisions
- **Action**: Robot executes commands via actuators (motors, servos)
- **Environment**: Actions affect the physical world
- **Learning**: Experience updates the AI model for improved future decisions
```

### 4B. Text Description Template

For diagrams that will be created as images later:

```markdown
### [Diagram Title]

**[Diagram: [Type] - [Subject]]**

[Detailed text description of what should be shown in the diagram, including:]
- Key components and their relationships
- Data flow or process flow
- Labels and annotations
- Color coding or visual hierarchy (if applicable)

**Components**:
1. [Component 1]: [Description]
2. [Component 2]: [Description]
3. [Component 3]: [Description]

**Connections**:
- [Component 1] → [Component 2]: [Relationship description]
- [Component 2] → [Component 3]: [Relationship description]
```

**Usage Example**:
```markdown
### Humanoid Robot Sensor Suite

**[Diagram: Architecture - Humanoid Robot Sensor Suite]**

This diagram shows the comprehensive sensor suite of a typical humanoid robot and how sensor data flows to the central processing unit.

**Components**:
1. **Head Sensors**:
   - Stereo RGB-D cameras (for depth perception and object recognition)
   - Microphone array (for audio input and voice commands)
2. **Torso Sensors**:
   - IMU (for orientation and balance)
   - Central processing unit (NVIDIA Jetson or equivalent)
3. **Limb Sensors**:
   - Joint encoders (in each joint for position feedback)
   - Force/torque sensors (in feet and hands)
4. **Base Sensors**:
   - LIDAR scanner (for 360° environment mapping)

**Connections**:
- All sensors → Central Processing Unit via high-speed data bus
- IMU → Balance Controller (real-time feedback loop)
- Cameras + LIDAR → Perception Module → Navigation Stack
- Force sensors → Contact Detection → Safety Controller
```

---

## 5. Summary and Key Takeaways Template

Every chapter MUST end with this section.

**Template**:
```markdown
## Summary

In this chapter, we explored [main topic of the chapter]. We covered [brief 2-3 sentence summary of key content].

[Optional: 1-2 sentences connecting this chapter to the next chapter or broader course context]

## Key Takeaways

- **[Concept 1]**: [One sentence explanation]
- **[Concept 2]**: [One sentence explanation]
- **[Concept 3]**: [One sentence explanation]
- **[Concept 4]**: [One sentence explanation]
- **[Concept 5]**: [One sentence explanation]

## Further Reading

- [Resource 1]: [Brief description and URL if applicable]
- [Resource 2]: [Brief description and URL if applicable]
- [Resource 3]: [Brief description and URL if applicable]
```

**Usage Example**:
```markdown
## Summary

In this chapter, we explored the fundamental concepts of Physical AI and embodied intelligence. We examined how Physical AI differs from traditional digital AI through its integration with physical sensors and actuators, enabling robots to perceive and act in the real world. We also surveyed the current landscape of humanoid robotics and the key sensor technologies that make Physical AI possible.

This foundation sets the stage for Chapter 2, where we'll dive into ROS 2, the robotic operating system that serves as the nervous system connecting sensors, AI, and actuators.

## Key Takeaways

- **Physical AI vs Digital AI**: Physical AI operates in the real world through sensors and actuators, while digital AI processes abstract data
- **Embodied Intelligence**: The perception-action-learning loop enables robots to learn from physical interaction with their environment
- **Humanoid Robotics**: Current humanoid robots face challenges in balance, dexterity, and natural human-robot interaction
- **Sensor Suite**: LIDAR, cameras, IMUs, and force/torque sensors provide comprehensive environmental awareness
- **Integration Challenge**: Combining multiple sensor modalities requires sophisticated data fusion and real-time processing

## Further Reading

- **Physical AI Overview**: Anthropic's Physical AI research - https://www.anthropic.com/research/physical-ai
- **ROS 2 Documentation**: Official ROS 2 Humble documentation - https://docs.ros.org/en/humble/
- **Humanoid Robotics Survey**: "Humanoid Robotics: A Reference" by Goswami & Vadakkepat
```

---

## 6. Cross-Reference Link Format

For internal links between chapters, use Docusaurus-compatible relative links.

**Template**:
```markdown
[Link Text](./chapter-X.md#section-id)
```

**Usage Examples**:
```markdown
# Link to another chapter (entire chapter)
As we discussed in [Chapter 1](./chapter-1.md), Physical AI requires embodied intelligence.

# Link to a specific section in another chapter
Refer to the [ROS 2 Architecture section](./chapter-2.md#ros-2-architecture-and-core-concepts) for details on nodes and topics.

# Link within the same chapter
See the [Learning Objectives](#learning-objectives) section above.
```

**Section ID Format**:
- Docusaurus automatically creates IDs from headers by:
  - Converting to lowercase
  - Replacing spaces with hyphens
  - Removing special characters

**Examples**:
- `## ROS 2 Architecture` → `#ros-2-architecture`
- `### Voice-to-Action Pipeline` → `#voice-to-action-pipeline`
- `## What is Physical AI?` → `#what-is-physical-ai`

---

## 7. Markdown Formatting Standards

### Headers
```markdown
# Chapter Title (H1 - used only once at the top, but frontmatter title is preferred)

## Major Section (H2)

### Subsection (H3)

#### Sub-subsection (H4 - use sparingly)
```

**Rules**:
- Use ATX-style headers (`#` syntax, not underline style)
- One H1 per chapter (or rely on frontmatter title)
- Logical hierarchy: H2 for main sections, H3 for subsections
- Avoid skipping levels (don't jump from H2 to H4)

### Lists

**Unordered Lists**:
```markdown
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2
- Item 3
```

**Ordered Lists**:
```markdown
1. First step
2. Second step
3. Third step
```

**Rules**:
- Use `-` for bullets (consistent throughout)
- Use proper indentation for nested lists (2 spaces)

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

**Alignment**:
```markdown
| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
```

### Emphasis

```markdown
**Bold text** for strong emphasis
*Italic text* for emphasis
`Inline code` for code snippets or technical terms
```

### Blockquotes

```markdown
> Important note or callout
> Can span multiple lines
```

### Code Blocks (Fenced)

```markdown
\```python
# Python code example
def hello():
    print("Hello, World!")
\```
```

**Always specify the language** for syntax highlighting.

---

## 8. Example Chapter Section

This example demonstrates all templates in action:

```markdown
---
id: chapter-2
title: "Chapter 2: The Robotic Nervous System (ROS 2)"
sidebar_label: "Chapter 2"
sidebar_position: 2
---

# The Robotic Nervous System (ROS 2)

## Learning Objectives

By the end of this chapter, you will be able to:

- **Understand** the architecture and core concepts of ROS 2
- **Explain** the differences between ROS 1 and ROS 2
- **Implement** basic ROS 2 nodes using Python and the rclpy library
- **Create** launch files for managing multiple ROS 2 nodes
- **Describe** URDF format for defining robot kinematics

## Introduction to ROS 2

ROS 2 (Robot Operating System 2) is the next-generation robotics middleware framework that provides a structured communication layer above the operating system. Unlike traditional operating systems, ROS 2 is a collection of tools, libraries, and conventions that simplify the task of creating complex and robust robot behavior across a wide variety of robotic platforms.

### What is ROS 2?

[Content continues...]

### ROS 1 vs ROS 2: Key Differences

| Feature | ROS 1 | ROS 2 |
|---------|-------|-------|
| Communication | TCPROS, UDPROS | DDS (Data Distribution Service) |
| Real-time Support | Limited | Full support with DDS |
| Platform Support | Primarily Linux | Linux, Windows, macOS |
| Security | Minimal | Built-in security (SROS2) |

[Content continues...]

## ROS 2 Architecture and Core Concepts

### Nodes: The Building Blocks

A **node** is a process that performs computation. ROS 2 is designed to be modular at a fine-grained scale: a robot control system usually comprises many nodes working together.

### Simple ROS 2 Publisher Node

This example creates a basic publisher node that sends string messages to a topic.

\```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HelloPublisher(Node):
    def __init__(self):
        super().__init__('hello_publisher')

        # Create a publisher that publishes String messages to 'hello_topic'
        self.publisher = self.create_publisher(String, 'hello_topic', 10)

        # Create a timer that calls the timer_callback every 1 second
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello, ROS 2! Message #{self.counter}'

        # Publish the message
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.counter += 1

def main(args=None):
    # Initialize the ROS 2 Python client library
    rclpy.init(args=args)

    # Create an instance of the HelloPublisher node
    node = HelloPublisher()

    # Keep the node running
    rclpy.spin(node)

    # Cleanup
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
\```

**Key points**:
- Nodes inherit from `rclpy.node.Node`
- Publishers are created with `create_publisher(message_type, topic_name, queue_size)`
- Timers enable periodic callbacks for publishing messages
- `rclpy.spin()` keeps the node running and processing callbacks

[Content continues...]

### ROS 2 Communication Architecture

\```mermaid
flowchart TB
    A[Publisher Node] -->|Publishes to| B[Topic: /hello_topic]
    B -->|Subscribes from| C[Subscriber Node]
    D[Service Client] -->|Request| E[Service: /add_two_ints]
    E -->|Response| D
    F[Action Client] -->|Goal| G[Action Server: /navigate]
    G -->|Feedback| F
    G -->|Result| F
\```

**Description**:
- **Topics**: One-to-many publish/subscribe pattern for streaming data
- **Services**: One-to-one request/response pattern for synchronous operations
- **Actions**: Long-running tasks with feedback and cancellation support

[Content continues...]

## Summary

In this chapter, we explored ROS 2, the robotic nervous system that connects sensors, actuators, and AI in modern robotics. We covered the core concepts of nodes, topics, services, and actions, and learned how to build ROS 2 packages using Python and the rclpy library. We also examined URDF for describing robot kinematics and how to bridge Python AI agents with ROS 2 controllers.

This knowledge is essential for the next chapter, where we'll use ROS 2 to integrate with physics simulation environments like Gazebo and Unity.

## Key Takeaways

- **ROS 2 Architecture**: Modular design using nodes communicating via topics, services, and actions
- **DDS Communication**: ROS 2 uses DDS for real-time, secure, cross-platform communication
- **Python Integration**: The rclpy library enables easy development of ROS 2 nodes in Python
- **URDF**: Unified Robot Description Format defines robot kinematics and physical properties
- **Launch Files**: XML or Python launch files manage complex multi-node systems

## Further Reading

- **ROS 2 Documentation**: https://docs.ros.org/en/humble/
- **rclpy API Reference**: https://docs.ros.org/en/humble/p/rclpy/
- **URDF Tutorials**: https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html
```

---

## 9. Template Validation Checklist

Before using these templates in chapter creation, verify:

- [X] Frontmatter template includes all required fields (id, title, sidebar_label, sidebar_position)
- [X] Learning objectives template uses Bloom's taxonomy verbs
- [X] Code block template includes language tags and explanatory comments
- [X] Diagram templates support both Mermaid and text descriptions
- [X] Summary and Key Takeaways template is complete
- [X] Cross-reference link format follows Docusaurus conventions
- [X] Markdown formatting standards comply with constitution Technical Standards
- [X] Example chapter section demonstrates all templates in context

---

## Constitution Compliance Verification

These templates align with the following constitution principles:

✅ **Principle I: Docusaurus-First Architecture** - Frontmatter template ensures Docusaurus compatibility
✅ **Principle III: Content Completeness & Clarity** - Learning objectives, code examples, diagrams, and summaries required
✅ **Principle IV: AI-Native Content Generation** - Code examples emphasize correctness and executability
✅ **Principle V: Minimal Design, Maximum Utility** - Templates are simple and focused on essential components

Constitution Technical Standards Compliance:
- ✅ ATX-style headers
- ✅ Language tags for code blocks
- ✅ Relative links for cross-references
- ✅ GitHub-flavored Markdown tables
- ✅ Docusaurus frontmatter format

**Templates validated**: 2025-12-06
**Status**: Ready for chapter content creation
