import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Testimonials from '@site/src/components/Testimonials';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function AnimatedBackground() {
  return (
    <div className={styles.animatedBackground}>
      <div className={styles.gradientOrb1}></div>
      <div className={styles.gradientOrb2}></div>
      <div className={styles.gradientOrb3}></div>
      <div className={styles.floatingParticles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={clsx(styles.heroBanner)}>
      <AnimatedBackground />
      <div className={styles.heroContainer}>
        <div className={clsx(styles.heroContent, isVisible && styles.fadeInUp)}>
          {/* Badge */}
          <div className={styles.heroBadge}>
            <span className={styles.badgeIcon}>🤖</span>
            <span className={styles.badgeText}>AI-Powered Learning Experience</span>
          </div>

          {/* Main Title with Gradient */}
          <Heading as="h1" className={styles.heroTitle}>
            <span className={styles.titleGradient}>
              {siteConfig.title}
            </span>
          </Heading>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            {siteConfig.tagline}
          </p>

          {/* Description */}
          <p className={styles.heroDescription}>
            Master the fundamentals of embodied AI, humanoid robotics, and intelligent machines
            that interact with the real world. Learn from industry experts and build cutting-edge projects.
          </p>

          {/* CTA Buttons */}
          <div className={styles.buttons}>
            <Link
              className={clsx('button', styles.primaryButton)}
              to="/docs/chapter-1">
              <span className={styles.buttonIcon}>🚀</span>
              <span>Start Learning Now</span>
              <span className={styles.buttonArrow}>→</span>
            </Link>

            <Link
              className={clsx('button', styles.secondaryButton)}
              to="/docs/chapter-1">
              <span className={styles.buttonIcon}>📚</span>
              <span>Browse Chapters</span>
            </Link>
          </div>

          {/* Stats */}
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>8+</div>
              <div className={styles.statLabel}>Chapters</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>AI-Powered</div>
              <div className={styles.statLabel}>Interactive Assistant</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>Free & Open</div>
            </div>
          </div>
        </div>

        {/* Animated Illustration */}
        <div className={clsx(styles.heroIllustration, isVisible && styles.fadeInRight)}>
          <div className={styles.illustrationCard}>
            <div className={styles.cardGlow}></div>
            <div className={styles.robotIcon}>🤖</div>
            <div className={styles.floatingElements}>
              <div className={styles.floatingElement} style={{ top: '10%', left: '10%' }}>⚙️</div>
              <div className={styles.floatingElement} style={{ top: '20%', right: '15%' }}>🧠</div>
              <div className={styles.floatingElement} style={{ bottom: '25%', left: '15%' }}>🔧</div>
              <div className={styles.floatingElement} style={{ bottom: '15%', right: '10%' }}>💡</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel}></div>
        </div>
        <span className={styles.scrollText}>Scroll to explore</span>
      </div>

      {/* Wave Divider */}
      <div className={styles.waveDivider}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className={styles.shapeFill}></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className={styles.shapeFill}></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className={styles.shapeFill}></path>
        </svg>
      </div>
    </header>
  );
}

function TrustedBy() {
  return (
    <section className={styles.trustedSection}>
      <div className={styles.trustedContainer}>
        <p className={styles.trustedLabel}>Powered by cutting-edge technology</p>
        <div className={styles.trustedLogos}>
          <div className={styles.techBadge}>React</div>
          <div className={styles.techBadge}>TypeScript</div>
          <div className={styles.techBadge}>AI/ML</div>
          <div className={styles.techBadge}>Docusaurus</div>
          <div className={styles.techBadge}>FastAPI</div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            Ready to Build the Future of Robotics?
          </Heading>
          <p className={styles.ctaDescription}>
            Join thousands of students and professionals learning to create intelligent machines that shape tomorrow.
          </p>
          <Link
            className={clsx('button', styles.ctaButton)}
            to="/docs/chapter-1">
            <span>Begin Your Journey</span>
            <span className={styles.ctaButtonIcon}>✨</span>
          </Link>
        </div>
        <div className={styles.ctaGlow}></div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Master Physical AI and Humanoid Robotics - A comprehensive guide to building intelligent machines that live in the real world">
      <HomepageHeader />
      <main className={styles.mainContent}>
        <TrustedBy />
        <HomepageFeatures />
        <Testimonials />
        <CTASection />
      </main>
    </Layout>
  );
}
