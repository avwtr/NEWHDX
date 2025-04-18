import type { Contribution } from "@/components/contribution-detail-modal"

// Sample data for live experiments
export const liveExperimentsData = [
  {
    id: 1,
    name: "Neural Network Optimization",
    description: "Optimizing neural network architecture for faster training",
    categories: ["ai", "machine-learning"],
    contributors: 5,
    startDate: "2024-01-15",
    status: "LIVE",
  },
  {
    id: 2,
    name: "fMRI Data Analysis",
    description: "Analyzing fMRI data to identify brain activity patterns",
    categories: ["neuroscience", "brain-mapping"],
    contributors: 3,
    startDate: "2024-02-01",
    status: "LIVE",
  },
]

// Sample notifications data
export const notificationsData = [
  {
    id: 1,
    type: "contribution",
    message: "New contribution request from Alex Kim: Neural Network Optimization Algorithm",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "follower",
    message: "Dr. Maria Lopez started following your lab",
    time: "1 day ago",
  },
  {
    id: 3,
    type: "contribution",
    message: "New contribution request from Emily Chen: fMRI Data Preprocessing Script",
    time: "3 days ago",
  },
  {
    id: 4,
    type: "mention",
    message: "Your lab was mentioned in a publication by Quantum Physics Lab",
    time: "1 week ago",
  },
]

// Sample funding data
export const fundingData = [
  {
    id: "equipment",
    name: "NEW EQUIPMENT FUND",
    description: "Help us purchase new fMRI equipment for our cognitive research studies.",
    currentAmount: 15000,
    goalAmount: 25000,
    percentFunded: 60,
    daysRemaining: 45,
  },
  {
    id: "conference",
    name: "CONFERENCE TRAVEL",
    description: "Support our researchers in presenting findings at international conferences.",
    currentAmount: 3500,
    goalAmount: 5000,
    percentFunded: 70,
    daysRemaining: 30,
  },
  {
    id: "stipend",
    name: "RESEARCH ASSISTANT STIPEND",
    description: "Fund stipends for graduate research assistants working on key projects.",
    currentAmount: 8000,
    goalAmount: 12000,
    percentFunded: 67,
    daysRemaining: 60,
  },
]

// Sample membership benefits
export const membershipBenefits = [
  { id: "1", text: "Access to member-only updates" },
  { id: "2", text: "Name in acknowledgments" },
  { id: "3", text: "Early access to publications" },
  { id: "4", text: "Quarterly virtual lab meetings" },
  { id: "5", text: "Access to raw datasets" },
]

// Sample donation benefits
export const donationBenefits = [
  { id: "1", text: "Support our research" },
  { id: "2", text: "Name in acknowledgments" },
  { id: "3", text: "Tax-deductible contribution" },
]

// Sample contributions data
export const contributionsData: Contribution[] = [
  {
    id: "contrib-1",
    title: "Neural Network Optimization Algorithm",
    description:
      "I've developed a new optimization algorithm for neural networks that reduces training time by up to 30% while maintaining accuracy. This approach uses a dynamic learning rate adjustment based on gradient history and network topology.\n\nThe algorithm has been tested on several benchmark datasets including MNIST, CIFAR-10, and ImageNet with consistent improvements across different network architectures.",
    contributor: {
      id: "user-1",
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "2 hours ago",
    status: "pending",
    files: [
      {
        id: "file-1",
        name: "optimization_algorithm.py",
        type: "code",
        url: "#",
        preview: `import tensorflow as tf
import numpy as np

class DynamicOptimizer(tf.keras.optimizers.Optimizer):
    def __init__(self, learning_rate=0.01, momentum=0.9, name="DynamicOptimizer", **kwargs):
        super().__init__(name, **kwargs)
        self._learning_rate = learning_rate
        self._momentum = momentum
        
    def _create_slots(self, var_list):
        for var in var_list:
            self.add_slot(var, "momentum")
            self.add_slot(var, "gradient_history")
            
    def _resource_apply_dense(self, grad, var, apply_state=None):
        # Implementation of the optimization algorithm
        momentum_var = self.get_slot(var, "momentum")
        grad_history = self.get_slot(var, "gradient_history")
        
        # Update gradient history
        new_grad_history = grad_history + tf.square(grad)
        
        # Calculate adaptive learning rate
        adaptive_lr = self._learning_rate / (tf.sqrt(new_grad_history) + 1e-7)
        
        # Apply momentum
        new_momentum = self._momentum * momentum_var - adaptive_lr * grad
        
        # Update variable
        var_update = var + new_momentum
        
        # Update slots
        momentum_var.assign(new_momentum)
        grad_history.assign(new_grad_history)
        
        return var.assign(var_update)`,
      },
      {
        id: "file-2",
        name: "benchmark_results.csv",
        type: "data",
        url: "#",
        preview: `Model,Dataset,Standard Optimizer,Dynamic Optimizer,Improvement
ResNet50,MNIST,98.2%,98.4%,+0.2%
ResNet50,CIFAR-10,92.5%,93.8%,+1.3%
ResNet50,ImageNet,76.1%,78.9%,+2.8%
VGG16,MNIST,98.5%,98.6%,+0.1%
VGG16,CIFAR-10,93.1%,94.2%,+1.1%
VGG16,ImageNet,71.3%,74.5%,+3.2%
MobileNet,MNIST,97.8%,98.0%,+0.2%
MobileNet,CIFAR-10,91.2%,92.9%,+1.7%
MobileNet,ImageNet,70.6%,73.8%,+3.2%`,
      },
      {
        id: "file-3",
        name: "research_notes.md",
        type: "document",
        url: "#",
        preview: `<h2>Research Notes: Dynamic Optimization Algorithm</h2>
<p>The key insight behind this algorithm is that different layers in a neural network require different learning rates based on their position and the complexity of features they're learning.</p>
<h3>Key Components:</h3>
<ul>
  <li>Gradient history tracking for each parameter</li>
  <li>Topology-aware rate adjustment</li>
  <li>Momentum with adaptive decay</li>
</ul>
<p>Future work could explore applying this to transformer architectures and reinforcement learning scenarios.</p>`,
      },
    ],
  },
  {
    id: "contrib-2",
    title: "fMRI Data Preprocessing Script",
    description:
      "I've created a comprehensive preprocessing pipeline for fMRI data that automates several key steps including motion correction, slice timing correction, spatial normalization, and noise reduction. The script is optimized for both 1.5T and 3T scanners and includes quality control visualizations at each step.",
    contributor: {
      id: "user-2",
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "3 days ago",
    status: "pending",
    files: [
      {
        id: "file-4",
        name: "fmri_preprocessing.py",
        type: "code",
        url: "#",
        preview: `import nibabel as nib
import numpy as np
from scipy import ndimage
import matplotlib.pyplot as plt

def motion_correction(img_data, affine):
    """
    Perform motion correction on fMRI data
    
    Parameters:
    -----------
    img_data : 4D numpy array (x, y, z, time)
        The fMRI data
    affine : numpy array
        The affine transformation matrix
        
    Returns:
    --------
    corrected_data : 4D numpy array
        Motion corrected fMRI data
    motion_params : numpy array
        Estimated motion parameters
    """
    print("Performing motion correction...")
    n_volumes = img_data.shape[3]
    reference_vol = img_data[:,:,:,0]
    corrected_data = np.zeros_like(img_data)
    corrected_data[:,:,:,0] = reference_vol
    motion_params = np.zeros((n_volumes, 6))  # 3 translation, 3 rotation parameters
    
    for vol_idx in range(1, n_volumes):
        # Simplified motion correction for example
        # In practice, would use more sophisticated registration algorithms
        current_vol = img_data[:,:,:,vol_idx]
        
        # Estimate motion parameters (simplified)
        shifts = np.array([0, 0, 0])  # x, y, z translations
        rotations = np.array([0, 0, 0])  # pitch, roll, yaw
        
        # Apply transformations (simplified)
        transformed_vol = ndimage.shift(current_vol, shifts)
        
        # Store corrected volume and motion parameters
        corrected_data[:,:,:,vol_idx] = transformed_vol
        motion_params[vol_idx, :3] = shifts
        motion_params[vol_idx, 3:] = rotations
        
    return corrected_data, motion_params`,
      },
      {
        id: "file-5",
        name: "sample_results.png",
        type: "document",
        url: "#",
      },
    ],
  },
  {
    id: "contrib-3",
    title: "Cognitive Assessment Battery",
    description:
      "I've developed a comprehensive cognitive assessment battery specifically designed for neuroscience research. It includes tests for working memory, attention, executive function, and processing speed, all implemented as web-based tasks that can be administered remotely.",
    contributor: {
      id: "user-3",
      name: "Jordan Taylor",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "1 week ago",
    status: "approved",
    files: [
      {
        id: "file-6",
        name: "cognitive_battery.js",
        type: "code",
        url: "#",
      },
      {
        id: "file-7",
        name: "test_instructions.pdf",
        type: "document",
        url: "#",
      },
      {
        id: "file-8",
        name: "normative_data.xlsx",
        type: "data",
        url: "#",
      },
    ],
  },
  {
    id: "contrib-4",
    title: "Brain Connectivity Analysis Toolkit",
    description:
      "This toolkit provides a comprehensive set of functions for analyzing functional and structural connectivity in the brain using various methods including correlation, partial correlation, and graph theoretical approaches.",
    contributor: {
      id: "user-4",
      name: "Michael Wong",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "2 weeks ago",
    status: "rejected",
    rejectReason:
      "Thank you for your submission, but we found several issues with the implementation that need to be addressed:\n\n1. The graph theory algorithms have significant performance issues with larger datasets\n2. There are compatibility issues with the latest neuroimaging data formats\n3. The documentation is incomplete for several key functions\n\nWe encourage you to address these issues and resubmit your contribution.",
    files: [
      {
        id: "file-9",
        name: "connectivity_toolkit.py",
        type: "code",
        url: "#",
      },
      {
        id: "file-10",
        name: "example_analysis.ipynb",
        type: "code",
        url: "#",
      },
    ],
  },
  {
    id: "contrib-5",
    title: "EEG Signal Processing Library",
    description:
      "A comprehensive library for processing and analyzing EEG signals, including filtering, artifact removal, time-frequency analysis, and source localization.",
    contributor: {
      id: "user-5",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    date: "3 weeks ago",
    status: "pending",
    files: [
      {
        id: "file-11",
        name: "eeg_processing.py",
        type: "code",
        url: "#",
      },
      {
        id: "file-12",
        name: "documentation.md",
        type: "document",
        url: "#",
      },
    ],
  },
]
