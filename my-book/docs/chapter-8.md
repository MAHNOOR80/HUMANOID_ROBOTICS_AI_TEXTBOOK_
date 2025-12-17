---
id: chapter-8
title: "Chapter 8: Capstone Project - The Autonomous Humanoid"
sidebar_label: "Chapter 8"
sidebar_position: 8
---

# Capstone Project: The Autonomous Humanoid

## Learning Objectives

By the end of this chapter, you will be able to:

- **Design** a complete autonomous humanoid system integrating perception, planning, navigation, manipulation, and conversation
- **Implement** voice command reception using Whisper and task planning with GPT
- **Configure** Nav2 for autonomous navigation with obstacle avoidance and dynamic replanning
- **Integrate** computer vision for object recognition and manipulation control
- **Test** and validate the complete system in simulation (Gazebo or Isaac Sim)
- **Evaluate** system performance using acceptance criteria and identify areas for improvement
- **Extend** the baseline system with advanced features like multi-robot coordination or reinforcement learning

## Project Overview

### Capstone Objectives

The capstone project brings together all concepts from Chapters 1-7 into a single, functional autonomous humanoid robot system. Your robot will:

1. **Listen** to voice commands from a human user
2. **Understand** commands using natural language processing
3. **Navigate** autonomously to specified locations
4. **Detect** and recognize objects in the environment
5. **Manipulate** objects through grasping and placement
6. **Converse** naturally with users to confirm actions and provide status updates

**Core Capabilities**:
- Voice-controlled task execution
- Autonomous navigation in cluttered environments
- Object detection and grasping
- Natural language conversation
- Robust error handling and recovery

**Example Interaction**:
```
Human: "Robo, can you bring me a bottle of water from the kitchen?"

Robot: "Sure! I'll go to the kitchen and look for a water bottle."
       [navigates to kitchen]
       [detects water bottle using computer vision]
       [grasps bottle]
       [navigates back to user]
       [hands bottle to user]
Robot: "Here's your water bottle. Anything else I can help with?"
```

### System Architecture

The autonomous humanoid integrates multiple subsystems:

```mermaid
graph TB
    VOICE[Voice Input<br/>Whisper ASR] --> NLU[Natural Language Understanding<br/>GPT-4]
    NLU --> PLANNER[Task Planner<br/>Action Sequencing]
    PLANNER --> NAV{Navigation<br/>Needed?}
    PLANNER --> MANIP{Manipulation<br/>Needed?}

    NAV -->|Yes| NAV2[Nav2 Stack<br/>Path Planning]
    NAV2 --> SENSORS1[LIDAR/Camera<br/>Obstacle Detection]
    NAV2 --> CMD_VEL[/cmd_vel]
    CMD_VEL --> BASE[Mobile Base]

    MANIP -->|Yes| VISION[Computer Vision<br/>Object Detection]
    VISION --> IK[Inverse Kinematics<br/>Arm Control]
    IK --> GRASP[Grasp Controller<br/>Force Control]
    GRASP --> ARM[Robotic Arm]

    BASE --> STATE[Robot State]
    ARM --> STATE
    STATE --> TTS[Text-to-Speech<br/>Status Updates]
    TTS --> SPEAKER[Speaker Output]

    style VOICE fill:#e1f5ff
    style NLU fill:#ffe1e1
    style PLANNER fill:#e1ffe1
    style NAV2 fill:#fff3e1
    style VISION fill:#f3e1ff
```

**Key Components**:
- **Speech Pipeline**: Whisper → GPT → TTS ([Chapter 5](chapter-5.md), [Chapter 7](chapter-7.md))
- **Navigation**: Nav2, SLAM, costmaps ([Chapter 4](chapter-4.md))
- **Perception**: Object detection, depth processing ([Chapter 4](chapter-4.md))
- **Manipulation**: IK, grasp planning, force control ([Chapter 6](chapter-6.md))
- **Simulation**: Gazebo/Isaac Sim testing ([Chapter 3](chapter-3.md))

### Integration Roadmap

**Phase 1**: Voice Command Reception (Week 1)
**Phase 2**: Navigation System (Week 2)
**Phase 3**: Object Recognition & Manipulation (Week 3-4)
**Phase 4**: System Integration & Testing (Week 5)

## Phase 1: Voice Command Reception

### Integrating Whisper and GPT

Building on [Chapter 5](chapter-5.md) and [Chapter 7](chapter-7.md), we create a voice command interface:

```python
import rclpy
from rclpy.node import Node
import whisper
import openai
import sounddevice as sd
import numpy as np

class VoiceCommandHandler(Node):
    """
    Capstone voice command handler
    Integrates Whisper (ASR) + GPT (NLU) + TTS
    """
    def __init__(self):
        super().__init__('voice_command_handler')

        # Load Whisper model
        self.get_logger().info("Loading Whisper model...")
        self.whisper_model = whisper.load_model("small")

        # GPT API
        openai.api_key = "your-api-key"

        # Audio parameters
        self.sample_rate = 16000
        self.recording_duration = 5.0

        # Conversation history
        self.conversation = [
            {"role": "system", "content": """You are Robo, an autonomous humanoid robot assistant.
You can perform these actions:
- navigate(location): Move to a location (kitchen, bedroom, living_room)
- pick(object, color): Pick up an object
- place(location): Place held object
- search(object): Search for an object
- wait(seconds): Wait for specified time

Parse user commands into JSON action sequences.
Example: "Bring me a cup from the kitchen"
Response: [
  {"action": "navigate", "params": {"location": "kitchen"}},
  {"action": "search", "params": {"object": "cup"}},
  {"action": "pick", "params": {"object": "cup"}},
  {"action": "navigate", "params": {"location": "user"}},
  {"action": "place", "params": {"location": "user_hand"}}
]
"""}
        ]

        self.get_logger().info("Voice Command Handler ready")

    def listen(self):
        """Record audio and transcribe with Whisper"""
        self.get_logger().info(f"Listening for {self.recording_duration} seconds...")

        # Record audio
        audio = sd.rec(
            int(self.recording_duration * self.sample_rate),
            samplerate=self.sample_rate,
            channels=1,
            dtype=np.float32
        )
        sd.wait()

        # Transcribe
        audio = audio.flatten()
        result = self.whisper_model.transcribe(audio, fp16=False)
        text = result['text'].strip()

        self.get_logger().info(f"Transcribed: {text}")
        return text

    def parse_command(self, command_text):
        """Parse command with GPT and extract actions"""
        self.conversation.append({"role": "user", "content": command_text})

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=self.conversation,
            temperature=0.0,
            max_tokens=300
        )

        assistant_message = response['choices'][0]['message']['content']
        self.conversation.append({"role": "assistant", "content": assistant_message})

        # Parse JSON actions
        import json
        try:
            actions = json.loads(assistant_message)
            return actions
        except json.JSONDecodeError:
            self.get_logger().error("Failed to parse GPT response as JSON")
            return []

    def run(self):
        """Main loop"""
        while rclpy.ok():
            # Listen for command
            command = self.listen()

            if not command or len(command) < 5:
                continue

            # Check for exit
            if "goodbye" in command.lower() or "stop" in command.lower():
                self.get_logger().info("Exiting voice command handler")
                break

            # Parse command into actions
            actions = self.parse_command(command)

            self.get_logger().info(f"Planned actions: {actions}")

            # Publish actions for execution (next phases)
            # TODO: Publish to action execution topic

# Main
def main():
    rclpy.init()
    handler = VoiceCommandHandler()
    handler.run()
    handler.destroy_node()
    rclpy.shutdown()
```

**Testing Phase 1**:
```bash
ros2 run capstone_robot voice_command_handler

# Test commands:
# - "Go to the kitchen"
# - "Find a red cup"
# - "Bring me a bottle"
```

## Phase 2: Path Planning and Navigation

### Nav2 Configuration for Humanoid

Configure Nav2 for narrow, humanoid footprint ([Chapter 4](chapter-4.md)):

**Complete Nav2 Parameters** (`capstone_nav2_params.yaml`):

```yaml
bt_navigator:
  ros__parameters:
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    navigators: ['navigate_to_pose', 'navigate_through_poses']
    navigate_to_pose:
      plugin: "nav2_bt_navigator/NavigateToPoseNavigator"
    navigate_through_poses:
      plugin: "nav2_bt_navigator/NavigateThroughPosesNavigator"

controller_server:
  ros__parameters:
    controller_frequency: 20.0
    progress_checker_plugins: ["progress_checker"]
    goal_checker_plugins: ["goal_checker"]
    controller_plugins: ["FollowPath"]

    progress_checker:
      plugin: "nav2_controller::SimpleProgressChecker"
      required_movement_radius: 0.5
      movement_time_allowance: 10.0

    goal_checker:
      plugin: "nav2_controller::SimpleGoalChecker"
      xy_goal_tolerance: 0.15
      yaw_goal_tolerance: 0.2

    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      min_vel_x: -0.2
      max_vel_x: 0.4
      min_vel_y: 0.0
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.4
      acc_lim_x: 0.5
      acc_lim_y: 0.0
      acc_lim_theta: 1.2
      decel_lim_x: -0.5
      decel_lim_y: 0.0
      decel_lim_theta: -1.2

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      rolling_window: true
      width: 4
      height: 4
      resolution: 0.05

      plugins: ["voxel_layer", "inflation_layer"]
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        footprint_clearing_enabled: true
        max_obstacle_height: 2.0
        z_voxels: 10
        origin_z: 0.0
        z_resolution: 0.2
        unknown_threshold: 15
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          sensor_frame: lidar_link
          observation_persistence: 0.0
          expected_update_rate: 0.0
          data_type: "LaserScan"
          min_obstacle_height: 0.0
          max_obstacle_height: 2.0
          clearing: True
          marking: True

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.4

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      robot_radius: 0.18
      resolution: 0.05

      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True

      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.4
```

**Navigation Client**:

```python
from rclpy.action import ActionClient
from nav2_msgs.action import NavigateToPose
from geometry_msgs.msg import PoseStamped

class NavigationController(Node):
    """
    High-level navigation interface
    """
    def __init__(self):
        super().__init__('navigation_controller')

        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')

        # Predefined locations
        self.locations = {
            'kitchen': {'x': 5.0, 'y': 2.0, 'yaw': 0.0},
            'bedroom': {'x': 8.0, 'y': 5.0, 'yaw': 1.57},
            'living_room': {'x': 2.0, 'y': 1.0, 'yaw': 3.14},
            'charging_station': {'x': 0.0, 'y': 0.0, 'yaw': 0.0}
        }

    def navigate_to(self, location_name):
        """Navigate to named location"""
        if location_name not in self.locations:
            self.get_logger().error(f"Unknown location: {location_name}")
            return False

        loc = self.locations[location_name]

        goal_msg = NavigateToPose.Goal()
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
        goal_msg.pose.pose.position.x = loc['x']
        goal_msg.pose.pose.position.y = loc['y']

        # Convert yaw to quaternion
        import math
        yaw = loc['yaw']
        goal_msg.pose.pose.orientation.z = math.sin(yaw / 2)
        goal_msg.pose.pose.orientation.w = math.cos(yaw / 2)

        self.get_logger().info(f"Navigating to {location_name}...")

        self.nav_client.wait_for_server()
        send_goal_future = self.nav_client.send_goal_async(goal_msg)

        rclpy.spin_until_future_complete(self, send_goal_future)
        goal_handle = send_goal_future.result()

        if not goal_handle.accepted:
            self.get_logger().error("Goal rejected")
            return False

        # Wait for result
        result_future = goal_handle.get_result_async()
        rclpy.spin_until_future_complete(self, result_future)

        self.get_logger().info(f"Reached {location_name}")
        return True
```

**Testing Phase 2**:
```bash
# Launch Nav2
ros2 launch capstone_robot navigation.launch.py

# Test navigation
ros2 run capstone_robot test_navigation
```

## Phase 3: Object Recognition and Manipulation

### Computer Vision Integration

Use YOLOv8 for object detection:

```python
from ultralytics import YOLO
import cv2
from sensor_msgs.msg import Image
from cv_bridge import CvBridge

class ObjectDetector(Node):
    """
    YOLOv8-based object detection
    """
    def __init__(self):
        super().__init__('object_detector')

        # Load YOLO model
        self.model = YOLO('yolov8n.pt')  # Nano model for speed

        # ROS 2 setup
        self.bridge = CvBridge()
        self.create_subscription(Image, '/camera/rgb/image_raw', self.image_callback, 10)

        # Detected objects
        self.detected_objects = []

    def image_callback(self, msg):
        """Process camera images"""
        cv_image = self.bridge.imgmsg_to_cv2(msg, 'bgr8')

        # Run YOLO inference
        results = self.model(cv_image, conf=0.5)

        # Parse detections
        self.detected_objects = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                xyxy = box.xyxy[0].cpu().numpy()

                obj = {
                    'class': self.model.names[cls],
                    'confidence': conf,
                    'bbox': xyxy.tolist(),
                    'center_x': (xyxy[0] + xyxy[2]) / 2,
                    'center_y': (xyxy[1] + xyxy[3]) / 2
                }
                self.detected_objects.append(obj)

        # Log detections
        if self.detected_objects:
            self.get_logger().info(f"Detected {len(self.detected_objects)} objects")

    def find_object(self, object_name):
        """Find specific object in current view"""
        for obj in self.detected_objects:
            if object_name.lower() in obj['class'].lower():
                return obj
        return None
```

### Manipulation Control

```python
from control_msgs.action import GripperCommand

class ManipulationController(Node):
    """
    Arm + gripper control for object manipulation
    """
    def __init__(self):
        super().__init__('manipulation_controller')

        # Gripper action client
        self.gripper_client = ActionClient(self, GripperCommand, '/gripper_controller/gripper_cmd')

    def pick_object(self, object_position):
        """
        Pick object at given 3D position

        Args:
            object_position: (x, y, z) in robot base frame
        """
        # 1. Compute IK to pre-grasp pose
        pre_grasp = (object_position[0] - 0.1, object_position[1], object_position[2])
        # TODO: Call IK service to get joint angles

        # 2. Move arm to pre-grasp pose
        # TODO: Send joint trajectory

        # 3. Open gripper
        self.open_gripper()

        # 4. Move to grasp pose
        # TODO: Send approach trajectory

        # 5. Close gripper
        self.close_gripper()

        # 6. Lift object
        # TODO: Send lift trajectory

        self.get_logger().info("Object picked successfully")

    def open_gripper(self):
        """Open gripper"""
        goal = GripperCommand.Goal()
        goal.command.position = 0.08  # Fully open (8cm)
        goal.command.max_effort = 10.0

        self.gripper_client.wait_for_server()
        self.gripper_client.send_goal_async(goal)

    def close_gripper(self):
        """Close gripper with force control"""
        goal = GripperCommand.Goal()
        goal.command.position = 0.0  # Fully closed
        goal.command.max_effort = 5.0  # Gentle grasp

        self.gripper_client.wait_for_server()
        self.gripper_client.send_goal_async(goal)
```

## Phase 4: System Integration

### Complete Autonomous System

Integrate all components:

```python
class AutonomousHumanoid(Node):
    """
    Complete capstone system integrating all subsystems
    """
    def __init__(self):
        super().__init__('autonomous_humanoid')

        # Components
        self.voice_handler = VoiceCommandHandler()
        self.navigator = NavigationController()
        self.detector = ObjectDetector()
        self.manipulator = ManipulationController()

        self.get_logger().info("Autonomous Humanoid System initialized")

    def execute_task(self, actions):
        """
        Execute sequence of actions

        Args:
            actions: List of action dicts from GPT
        """
        for i, action in enumerate(actions):
            self.get_logger().info(f"Executing action {i+1}/{len(actions)}: {action}")

            action_type = action['action']
            params = action.get('params', {})

            try:
                if action_type == 'navigate':
                    success = self.navigator.navigate_to(params['location'])
                    if not success:
                        self.get_logger().error("Navigation failed")
                        return False

                elif action_type == 'search':
                    # Wait for object detection
                    rclpy.spin_once(self.detector, timeout_sec=1.0)
                    obj = self.detector.find_object(params['object'])

                    if obj:
                        self.get_logger().info(f"Found {params['object']}")
                    else:
                        self.get_logger().warn(f"Object {params['object']} not found")

                elif action_type == 'pick':
                    obj = self.detector.find_object(params['object'])
                    if obj:
                        # Estimate 3D position (simplified)
                        obj_pos_3d = (1.0, 0.0, 0.5)  # Would use depth camera
                        self.manipulator.pick_object(obj_pos_3d)
                    else:
                        self.get_logger().error(f"Cannot pick - {params['object']} not detected")

                elif action_type == 'place':
                    # Place object at location
                    self.manipulator.place_object(params['location'])

                elif action_type == 'wait':
                    import time
                    time.sleep(params.get('seconds', 1.0))

            except Exception as e:
                self.get_logger().error(f"Action failed: {e}")
                return False

        self.get_logger().info("Task completed successfully!")
        return True

# Launch
def main():
    rclpy.init()
    robot = AutonomousHumanoid()

    # Wait for voice command
    command = robot.voice_handler.listen()
    actions = robot.voice_handler.parse_command(command)

    # Execute
    robot.execute_task(actions)

    robot.destroy_node()
    rclpy.shutdown()
```

## Testing and Validation

### Unit Tests

Test individual components:

```python
import unittest

class TestNavigation(unittest.TestCase):
    def test_navigate_to_kitchen(self):
        """Test navigation to kitchen"""
        navigator = NavigationController()
        result = navigator.navigate_to('kitchen')
        self.assertTrue(result)

class TestObjectDetection(unittest.TestCase):
    def test_detect_cup(self):
        """Test cup detection"""
        detector = ObjectDetector()
        # Load test image
        # Run detection
        # Assert cup is detected
        pass
```

### Integration Tests

Test complete workflow in simulation:

**Test Scenarios**:
1. "Go to the kitchen" → Navigate successfully
2. "Find a cup" → Detect cup with confidence > 0.7
3. "Bring me a bottle" → Navigate + detect + pick + return

### Acceptance Checklist

✅ Voice command recognition (>90% accuracy)
✅ Navigation to all locations without collision
✅ Object detection for 5+ object classes
✅ Successful grasp rate >80%
✅ Complete fetch task end-to-end
✅ Conversation with context (3+ turns)
✅ Error recovery (retry failed actions)

## Extensions and Future Work

### Multi-Robot Coordination

Deploy multiple humanoids working together:
- **Task allocation**: Distribute tasks among robots
- **Collision avoidance**: Coordinate navigation
- **Shared perception**: Exchange detected object locations

### Advanced Learning

**Reinforcement Learning**:
- Train grasping policies in Isaac Gym ([Chapter 4](chapter-4.md))
- Learn locomotion for stairs/uneven terrain
- Optimize navigation policies

**Imitation Learning**:
- Learn from human demonstrations
- Teleoperation for data collection
- Behavior cloning

### Real-World Deployment

**Sim-to-Real Transfer**:
- Domain randomization in simulation
- System identification of real robot
- Gradual deployment (sim → lab → field)

**Safety & Robustness**:
- Redundant sensors
- Watchdog timers
- Emergency stop systems
- Compliance control

## Summary

In this capstone project, you integrated all concepts from the textbook into a complete autonomous humanoid robot system. You implemented voice command reception with Whisper and GPT, autonomous navigation with Nav2, computer vision for object detection, and manipulation control for grasping. The resulting system can understand natural language commands, navigate safely, perceive its environment, and interact with objects—demonstrating the full Physical AI pipeline from perception to action.

This project represents the culmination of your humanoid robotics journey, from foundational concepts in [Chapter 1](chapter-1.md) through ROS 2, simulation, AI integration, and humanoid-specific techniques. The skills and system architecture you've developed here form a strong foundation for advanced robotics research and development.

## Key Takeaways

- **System Integration**: Combining perception, planning, navigation, manipulation, and conversation requires careful interface design and error handling
- **Voice Control**: Natural language interfaces (Whisper + GPT) make robots accessible to non-expert users
- **Navigation**: Nav2 provides robust autonomous navigation with dynamic obstacle avoidance
- **Perception**: Computer vision (YOLO, depth cameras) enables object detection and scene understanding
- **Manipulation**: IK + force control enables safe, reliable object grasping
- **Testing**: Unit tests, integration tests, and acceptance criteria ensure system reliability
- **Extensibility**: The baseline system can be extended with learning, multi-robot coordination, and real-world deployment
- **Iteration**: Robotics development is iterative—test early, fail fast, improve continuously

## Further Reading

- **ROS 2 Tutorials**: https://docs.ros.org/en/humble/Tutorials.html — Complete system integration examples
- **Nav2 Tuning Guide**: https://navigation.ros.org/tuning/index.html — Optimize navigation performance
- **MoveIt 2**: https://moveit.ros.org/ — Advanced manipulation and motion planning
- **SLAM Toolbox**: https://github.com/SteveMacenski/slam_toolbox — Build maps for navigation
- **Behavior Trees**: https://www.behaviortree.dev/ — Coordinate complex robot behaviors
- **Sim-to-Real Transfer**: Research papers on domain randomization and transfer learning

**Congratulations!** You've completed the Physical AI & Humanoid Robotics textbook. You now have the knowledge and skills to design, implement, and deploy autonomous humanoid robots. The field of robotics is rapidly evolving—continue learning, experimenting, and building to stay at the cutting edge of Physical AI.
