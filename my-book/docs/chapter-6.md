---
id: chapter-6
title: "Chapter 6: Humanoid Robot Development"
sidebar_label: "Chapter 6"
sidebar_position: 6
---

# Humanoid Robot Development

## Learning Objectives

By the end of this chapter, you will be able to:

- **Understand** the unique design considerations and challenges of humanoid robotics compared to other robot forms
- **Apply** forward and inverse kinematics algorithms for humanoid arm and leg control
- **Implement** bipedal locomotion and balance control using Zero-Moment Point (ZMP) criteria
- **Design** manipulation and grasping systems with force control for safe object handling
- **Evaluate** natural human-robot interaction strategies including expressive motion and safety protocols
- **Integrate** humanoid-specific techniques into complete robotic systems

## Introduction to Humanoid Robotics

### What Makes Humanoid Robots Unique?

**Humanoid robots** are designed to mimic the human form, typically featuring a torso, two arms, two legs, and a head. This anthropomorphic design is not merely aesthetic—it enables robots to operate in environments built for humans (stairs, doors, furniture) and interact naturally with people.

**Key Characteristics**:
- **Bipedal locomotion**: Walking on two legs requires sophisticated balance control
- **Dexterous manipulation**: Human-like arms and hands enable tool use and object manipulation
- **High degrees of freedom (DOF)**: 20-50+ actuated joints (vs. 6-7 for industrial arms)
- **Upright posture**: Center of mass high above ground, inherently unstable
- **Social presence**: Human-like appearance facilitates interaction and communication

**Why Humanoid Form?**

1. **Human-Centric Environments**: Our world is designed for bipedal humans
   - Stairs, escalators, narrow doorways
   - Standard furniture, tools, vehicles
   - No need to redesign infrastructure

2. **Natural Interaction**: People intuitively understand humanoid body language
   - Gestures, gaze direction, posture
   - Expressive communication
   - Reduced "uncanny valley" with good design

3. **Versatility**: General-purpose capability
   - Same robot can navigate, manipulate, and interact
   - Multi-task capability (unlike specialized robots)
   - Adaptable to various environments

### Design Considerations

Humanoid robot design involves trade-offs across multiple dimensions:

| Design Aspect | Considerations | Trade-offs |
|---------------|----------------|------------|
| **Height/Size** | Human-scale (1.5-1.8m) vs. compact (0.5-1.0m) | Reach vs. stability, cost vs. capability |
| **Weight** | Lightweight (10-20kg) vs. robust (50-100kg) | Portability vs. strength, battery life |
| **Actuation** | Electric motors vs. hydraulics vs. pneumatics | Precision vs. power, complexity vs. efficiency |
| **Sensing** | Minimal sensors vs. rich perception | Cost vs. capability, latency vs. accuracy |
| **Hands** | Simple grippers vs. dexterous hands | Simplicity vs. versatility, control complexity |
| **Power** | Battery capacity vs. weight | Runtime vs. mobility, recharging frequency |

**Notable Humanoid Platforms** (2024-2025):
- **Boston Dynamics Atlas**: Hydraulic actuation, exceptional dynamics (backflips, parkour)
- **Tesla Optimus**: Electric motors, designed for mass production and factory work
- **Figure 01**: Electric, commercial deployment focus (warehouses, retail)
- **Agility Robotics Digit**: Bipedal for logistics, torso-less design
- **NAO (SoftBank)**: Educational/research platform, fully electric
- **TALOS (PAL Robotics)**: Research humanoid, ROS 2 native

## Humanoid Kinematics and Dynamics

### Forward and Inverse Kinematics

**Kinematics** describes the motion of joints and links without considering forces. For humanoid robots, we need both:

1. **Forward Kinematics (FK)**: Given joint angles, compute end-effector position
2. **Inverse Kinematics (IK)**: Given desired end-effector position, compute required joint angles

**Forward Kinematics Example** (simplified 2-link arm):

```python
import numpy as np
import matplotlib.pyplot as plt

def forward_kinematics_2link(theta1, theta2, l1=1.0, l2=1.0):
    """
    Compute end-effector position for 2-link planar arm

    Args:
        theta1: Shoulder joint angle (radians)
        theta2: Elbow joint angle (radians)
        l1: Length of link 1 (upper arm)
        l2: Length of link 2 (forearm)

    Returns:
        (x, y): End-effector position
    """
    # Shoulder position (origin)
    x0, y0 = 0, 0

    # Elbow position
    x1 = l1 * np.cos(theta1)
    y1 = l1 * np.sin(theta1)

    # End-effector position
    x2 = x1 + l2 * np.cos(theta1 + theta2)
    y2 = y1 + l2 * np.sin(theta1 + theta2)

    return (x2, y2), (x1, y1)  # End-effector and elbow positions

# Example
theta1 = np.pi / 4  # 45 degrees
theta2 = np.pi / 3  # 60 degrees

end_effector, elbow = forward_kinematics_2link(theta1, theta2)
print(f"End-effector position: x={end_effector[0]:.3f}, y={end_effector[1]:.3f}")
```

**Inverse Kinematics** (analytic solution for 2-link arm):

```python
def inverse_kinematics_2link(x, y, l1=1.0, l2=1.0):
    """
    Compute joint angles to reach target position (x, y)

    Args:
        x, y: Target end-effector position
        l1, l2: Link lengths

    Returns:
        (theta1, theta2): Joint angles (radians)
        Returns None if target is unreachable
    """
    # Check if target is reachable
    distance = np.sqrt(x**2 + y**2)

    if distance > (l1 + l2) or distance < abs(l1 - l2):
        print("Target unreachable")
        return None

    # Law of cosines for theta2
    cos_theta2 = (x**2 + y**2 - l1**2 - l2**2) / (2 * l1 * l2)
    cos_theta2 = np.clip(cos_theta2, -1, 1)  # Numerical stability

    # Two solutions: elbow up or elbow down
    theta2_up = np.arccos(cos_theta2)
    theta2_down = -np.arccos(cos_theta2)

    # Choose elbow-up solution (theta2 positive)
    theta2 = theta2_up

    # Solve for theta1
    k1 = l1 + l2 * np.cos(theta2)
    k2 = l2 * np.sin(theta2)

    theta1 = np.arctan2(y, x) - np.arctan2(k2, k1)

    return (theta1, theta2)

# Example: Reach target (1.5, 1.0)
target_x, target_y = 1.5, 1.0
solution = inverse_kinematics_2link(target_x, target_y)

if solution:
    theta1, theta2 = solution
    print(f"Joint angles: theta1={np.degrees(theta1):.1f}°, theta2={np.degrees(theta2):.1f}°")

    # Verify solution
    reached, _ = forward_kinematics_2link(theta1, theta2)
    print(f"Reached position: x={reached[0]:.3f}, y={reached[1]:.3f}")
    print(f"Error: {np.linalg.norm(np.array(reached) - np.array([target_x, target_y])):.6f}")
```

**For Complex Humanoids**: Analytic IK becomes intractable. Use:
- **Jacobian-based IK**: Iterative numerical methods
- **Optimization-based IK**: Minimize error with constraints
- **Learning-based IK**: Neural networks trained on robot data

### Degrees of Freedom

Humanoid robots typically have 20-50 degrees of freedom:

**Typical DOF Distribution**:
- **Head**: 2-3 DOF (pan, tilt, optional roll)
- **Torso**: 1-3 DOF (waist rotation, bending)
- **Each Arm**: 6-7 DOF (shoulder 3, elbow 1, wrist 3)
- **Each Hand**: 1-20 DOF (simple gripper to dexterous hand)
- **Each Leg**: 6 DOF (hip 3, knee 1, ankle 2)

**Example: 30-DOF Humanoid**
- Head: 2 DOF
- Torso: 2 DOF
- Arms: 2 × 7 = 14 DOF
- Hands: 2 × 1 = 2 DOF (simple grippers)
- Legs: 2 × 6 = 12 DOF

**Kinematic Chains**: URDF representation defines parent-child joint relationships (as seen in [Chapter 2](chapter-2.md)).

## Bipedal Locomotion and Balance Control

Walking on two legs is one of robotics' grand challenges. Unlike wheeled or quadruped robots, bipedal robots are inherently **dynamically unstable**.

### Gait Generation

**Gait**: Cyclic pattern of leg movements. Humanoid walking involves:

1. **Stance phase**: Foot on ground, supporting body weight
2. **Swing phase**: Foot in air, moving forward
3. **Double support**: Both feet on ground (transition)
4. **Single support**: One foot on ground (less stable)

**Simple Gait Generator** (periodic trajectory):

```python
import numpy as np
import matplotlib.pyplot as plt

class SimpleGaitGenerator:
    """
    Generate sinusoidal walking pattern for bipedal robot
    """
    def __init__(self, step_length=0.1, step_height=0.05, stride_time=1.0):
        """
        Args:
            step_length: Forward distance per step (meters)
            step_height: Maximum foot lift height (meters)
            stride_time: Time for complete stride (both feet) (seconds)
        """
        self.step_length = step_length
        self.step_height = step_height
        self.stride_time = stride_time
        self.time = 0.0

    def get_foot_trajectory(self, t, is_right_foot=True):
        """
        Compute foot position at time t

        Args:
            t: Time (seconds)
            is_right_foot: True for right foot, False for left

        Returns:
            (x, y, z): Foot position relative to hip
        """
        # Phase offset between left and right feet
        phase = 0.0 if is_right_foot else np.pi

        # Normalized time within stride
        theta = (2 * np.pi * t / self.stride_time) + phase

        # Forward/backward (x)
        x = (self.step_length / 2) * np.sin(theta)

        # Lateral (y) - simplified: no lateral motion
        y = 0.0

        # Vertical (z) - lift foot during swing phase
        if 0 <= (theta % (2 * np.pi)) <= np.pi:  # Swing phase
            z = self.step_height * np.sin(theta % (2 * np.pi))
        else:  # Stance phase
            z = 0.0

        return (x, y, z)

    def visualize_gait(self, duration=4.0, dt=0.05):
        """Visualize gait pattern"""
        times = np.arange(0, duration, dt)
        left_traj = np.array([self.get_foot_trajectory(t, is_right_foot=False) for t in times])
        right_traj = np.array([self.get_foot_trajectory(t, is_right_foot=True) for t in times])

        plt.figure(figsize=(12, 4))

        # X-Z plane (forward-vertical)
        plt.subplot(1, 2, 1)
        plt.plot(left_traj[:, 0], left_traj[:, 2], 'b-', label='Left Foot')
        plt.plot(right_traj[:, 0], right_traj[:, 2], 'r-', label='Right Foot')
        plt.xlabel('X (forward) [m]')
        plt.ylabel('Z (height) [m]')
        plt.title('Foot Trajectory (Side View)')
        plt.legend()
        plt.grid(True)

        # Time series
        plt.subplot(1, 2, 2)
        plt.plot(times, left_traj[:, 2], 'b-', label='Left Foot Height')
        plt.plot(times, right_traj[:, 2], 'r-', label='Right Foot Height')
        plt.xlabel('Time [s]')
        plt.ylabel('Height [m]')
        plt.title('Foot Height vs. Time')
        plt.legend()
        plt.grid(True)

        plt.tight_layout()
        plt.show()

# Example usage
gait = SimpleGaitGenerator(step_length=0.2, step_height=0.06, stride_time=1.2)
# gait.visualize_gait()  # Uncomment to plot
```

### Zero-Moment Point (ZMP) Criterion

The **Zero-Moment Point** is a fundamental concept in bipedal stability. The ZMP is the point on the ground where the net moment of forces is zero.

**ZMP Stability Criterion**:
- **Stable**: ZMP inside support polygon (area bounded by feet on ground)
- **Unstable**: ZMP outside support polygon → robot will tip over

**Support Polygon**:
- **Double support**: Rectangular region between both feet
- **Single support**: Foot contact area (much smaller)

```python
def compute_zmp(com_position, com_velocity, com_acceleration, g=9.81):
    """
    Compute Zero-Moment Point position (simplified 2D)

    Args:
        com_position: [x, z] center of mass position
        com_velocity: [vx, vz] center of mass velocity
        com_acceleration: [ax, az] center of mass acceleration
        g: Gravitational acceleration

    Returns:
        zmp_x: ZMP position in x direction
    """
    x_com, z_com = com_position
    ax, az = com_acceleration

    # ZMP formula (simplified)
    zmp_x = x_com - (z_com / (az + g)) * ax

    return zmp_x

# Example
com_pos = [0.0, 0.8]  # CoM at height 0.8m
com_vel = [0.1, 0.0]  # Moving forward at 0.1 m/s
com_acc = [0.2, 0.0]  # Accelerating forward

zmp = compute_zmp(com_pos, com_vel, com_acc)
print(f"ZMP position: {zmp:.3f} m")

# Check stability (single support, foot from -0.1 to 0.1)
foot_min, foot_max = -0.1, 0.1
if foot_min <= zmp <= foot_max:
    print("Stable: ZMP inside support polygon")
else:
    print(f"Unstable: ZMP outside support polygon [{foot_min}, {foot_max}]")
```

**Balance Controllers**: Adjust robot posture to keep ZMP within support polygon:
- **Ankle strategy**: Small adjustments using ankle torques
- **Hip strategy**: Larger corrections using hip motion
- **Stepping strategy**: Take a step to establish new support polygon

## Manipulation and Grasping

Humanoid manipulation combines arm control with hand/gripper operation.

### End-Effector Design

**Gripper Types**:

1. **Parallel Jaw Gripper**: Simple, reliable (1 DOF)
   - Pros: Easy control, robust
   - Cons: Limited versatility

2. **Multi-Finger Hand**: Human-like dexterity (10-20 DOF)
   - Pros: Versatile grasping, tool use
   - Cons: Complex control, expensive

3. **Underactuated Hand**: Compliant, adaptive (3-5 DOF)
   - Pros: Naturally conforms to object shape
   - Cons: Limited precision

### Grasping Algorithms

**Force Control Example**:

```python
import numpy as np

class ForceControlGripper:
    """
    Simple force-controlled gripper
    """
    def __init__(self, max_force=50.0, force_threshold=5.0):
        """
        Args:
            max_force: Maximum gripper force (Newtons)
            force_threshold: Target grasping force (Newtons)
        """
        self.max_force = max_force
        self.force_threshold = force_threshold
        self.current_force = 0.0
        self.position = 0.0  # 0 = open, 1 = closed

    def grasp(self, dt=0.01, duration=2.0):
        """
        Execute grasp with force control

        Args:
            dt: Time step (seconds)
            duration: Max grasp duration (seconds)

        Returns:
            Success (True/False)
        """
        time = 0.0
        closing_speed = 0.1  # Position units per second

        print("Initiating grasp...")

        while time < duration:
            # Close gripper
            self.position += closing_speed * dt
            self.position = min(self.position, 1.0)

            # Simulate force sensor (would read from real sensor)
            self.current_force = self.simulate_contact_force()

            # Check if object is grasped
            if self.current_force >= self.force_threshold:
                print(f"Object grasped! Force: {self.current_force:.2f} N")
                return True

            # Safety check: max force exceeded
            if self.current_force >= self.max_force:
                print(f"Max force exceeded! Force: {self.current_force:.2f} N")
                self.position -= closing_speed * dt  # Back off slightly
                return False

            time += dt

        print("Grasp timeout - no object detected")
        return False

    def simulate_contact_force(self):
        """
        Simulate force sensor (replace with real sensor reading)
        Force increases as gripper closes
        """
        if self.position > 0.5:  # Contact after 50% closure
            contact_depth = self.position - 0.5
            force = contact_depth * 100.0  # Stiffness coefficient
            return force
        return 0.0

# Usage
gripper = ForceControlGripper(max_force=50.0, force_threshold=10.0)
success = gripper.grasp(duration=3.0)
```

**Grasp Planning**:
1. **Detect object**: Computer vision (from [Chapter 4](chapter-4.md))
2. **Estimate pose**: 6D pose estimation
3. **Plan approach**: Collision-free path to pre-grasp pose
4. **Execute grasp**: Close gripper with force control
5. **Verify**: Check force/tactile sensors for successful grasp

## Natural Human-Robot Interaction

### Expressive Motion

Humanoid robots can communicate through motion:

**Expressive Gestures**:
- **Nodding**: Agreement, acknowledgment
- **Head shaking**: Disagreement, refusal
- **Waving**: Greeting, attention-getting
- **Pointing**: Indicating direction or object
- **Shrugging**: Uncertainty, "I don't know"

**Implementation** (simplified nodding):

```python
def generate_nod_trajectory(duration=1.0, amplitude=0.3):
    """
    Generate head nodding motion

    Args:
        duration: Nod duration (seconds)
        amplitude: Nod angle amplitude (radians)

    Returns:
        List of (time, angle) tuples
    """
    dt = 0.05  # 20 Hz
    times = np.arange(0, duration, dt)

    # Sinusoidal nod motion
    angles = amplitude * np.sin(2 * np.pi * times / duration)

    trajectory = list(zip(times, angles))
    return trajectory

# Example
nod_traj = generate_nod_trajectory(duration=0.8, amplitude=0.4)
print(f"Generated {len(nod_traj)} waypoints for nodding motion")
```

### Safety Considerations

**Human safety is paramount**:

1. **Collision avoidance**: Detect humans, stop/slow when near
2. **Force limiting**: Limit joint torques, compliant control
3. **Emergency stop**: Large red button, wireless kill switch
4. **Soft materials**: Padded surfaces, rounded edges
5. **Predictable motion**: Avoid sudden, unexpected movements

**ISO 10218 / ISO/TS 15066**: Safety standards for collaborative robots.

## Summary

In this chapter, we explored the unique challenges and techniques of humanoid robot development. Humanoid robots combine bipedal locomotion, dexterous manipulation, and social interaction in an integrated system designed to operate in human environments. We covered forward and inverse kinematics for arm control, gait generation and balance control using Zero-Moment Point criteria, force-controlled grasping, and natural interaction through expressive motion.

Developing humanoid robots requires integrating knowledge from kinematics, dynamics, control theory, computer vision, and human-robot interaction—making it one of the most interdisciplinary areas in robotics. The techniques in this chapter form the foundation for the capstone project in [Chapter 8](chapter-8.md).

## Key Takeaways

- **Humanoid Form Factor**: Designed for human environments and natural interaction, but inherently more complex than wheeled or tracked robots
- **Kinematics**: Forward kinematics computes end-effector position from joint angles; inverse kinematics computes required joint angles for desired position
- **DOF**: Humanoid robots typically have 20-50 degrees of freedom across head, torso, arms, hands, and legs
- **Bipedal Locomotion**: Walking requires cyclic gait patterns with stance and swing phases for each leg
- **ZMP Stability**: Zero-Moment Point must remain within support polygon to prevent tipping; balance controllers adjust posture to maintain stability
- **Manipulation**: Force-controlled grasping enables safe, reliable object handling; dexterous hands increase versatility but add control complexity
- **Expressive Motion**: Gestures and body language enable natural human-robot communication
- **Safety**: Force limiting, collision avoidance, and compliance are critical for safe human-robot interaction

## Further Reading

- **Humanoid Robotics Textbook**: "Humanoid Robotics: A Reference" by Goswami & Vadakkepat
- **Bipedal Locomotion**: "Biped Locomotion: Dynamics, Stability, Control and Application" by Vukobratović
- **ZMP Tutorial**: Kajita et al., "The 3D Linear Inverted Pendulum Mode" (classic paper)
- **Grasping**: "Robotic Grasping and Contact: A Review" by Bicchi & Kumar
- **MoveIt 2**: https://moveit.ros.org/ — Motion planning for manipulation (integrates IK, collision avoidance)
- **ROS 2 Control**: https://control.ros.org/ — Real-time controller framework for joint control

**Cross-Reference**: This chapter builds on URDF from [Chapter 2](chapter-2.md), simulation from [Chapter 3](chapter-3.md), and perception from [Chapter 4](chapter-4.md). The humanoid control techniques presented here will be integrated into the complete autonomous system in [Chapter 8](chapter-8.md).
