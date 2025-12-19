import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type Testimonial = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Robotics Engineer',
    company: 'Boston Dynamics',
    avatar: '👩‍🔬',
    content: 'This textbook provides an exceptional foundation in physical AI and humanoid robotics. The interactive AI assistant makes learning complex concepts incredibly accessible.',
    rating: 5,
  },
  {
    name: 'Alex Martinez',
    role: 'Ph.D. Candidate',
    company: 'MIT',
    avatar: '👨‍🎓',
    content: 'The comprehensive coverage of embodied AI, combined with hands-on projects, makes this the best resource for anyone serious about humanoid robotics.',
    rating: 5,
  },
  {
    name: 'Dr. James Liu',
    role: 'AI Research Lead',
    company: 'Tesla AI',
    avatar: '👨‍💼',
    content: 'Outstanding blend of theory and practice. The chapters on perception and control systems are particularly well-structured and informative.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Robotics Student',
    company: 'Stanford University',
    avatar: '👩‍🎓',
    content: 'As a student, I found this textbook invaluable. The AI-powered Q&A feature helped me understand difficult concepts quickly and efficiently.',
    rating: 5,
  },
  {
    name: 'Prof. Michael Zhang',
    role: 'Professor of Robotics',
    company: 'Carnegie Mellon',
    avatar: '👨‍🏫',
    content: 'I recommend this textbook to all my students. It covers the latest developments in physical AI while maintaining rigorous academic standards.',
    rating: 5,
  },
  {
    name: 'Sophia Kim',
    role: 'Machine Learning Engineer',
    company: 'Figure AI',
    avatar: '👩‍💻',
    content: 'The practical examples and real-world applications throughout the book make it an essential resource for anyone working in humanoid robotics.',
    rating: 5,
  },
];

function TestimonialCard({ name, role, company, avatar, content, rating }: Testimonial) {
  return (
    <div className={styles.testimonialCard}>
      <div className={styles.cardHeader}>
        <div className={styles.avatarContainer}>
          <span className={styles.avatar}>{avatar}</span>
        </div>
        <div className={styles.authorInfo}>
          <h4 className={styles.authorName}>{name}</h4>
          <p className={styles.authorRole}>{role}</p>
          <p className={styles.authorCompany}>{company}</p>
        </div>
      </div>
      <div className={styles.rating}>
        {[...Array(rating)].map((_, i) => (
          <span key={i} className={styles.star}>⭐</span>
        ))}
      </div>
      <p className={styles.testimonialContent}>&ldquo;{content}&rdquo;</p>
      <div className={styles.quoteIcon}>&ldquo;</div>
    </div>
  );
}

export default function Testimonials(): ReactNode {
  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            What Students & Professionals Say
          </Heading>
          <p className={styles.sectionSubtitle}>
            Join thousands of learners who have transformed their understanding of physical AI and humanoid robotics
          </p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
