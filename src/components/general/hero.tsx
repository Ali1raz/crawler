import { motion } from 'motion/react';
import { buttonVariants } from '#/components/ui/button';
import ImageLight from '/public/image-light.png';
import ImageDark from '/public/image-dark.png';
import { Link } from '@tanstack/react-router';

export function Hero() {
  return (
    <motion.div
      className="flex flex-col gap-16 items-center justify-center py-2 md:mt-8 mt-4 lg:pt-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <section className="flex flex-col lg:flex-row items-center justify-between w-full max-xl:gap-6 max-w-7xl lg:max-w-6xl">
        <p className="max-md:font-medium text-3xl md:text-5xl lg:text-6xl xl:text-7xl lg:max-w-lg xl:max-w-2xl tracking-tighter text-center lg:text-left">
          Crawl the web for your AI agents
        </p>
        <section className="flex flex-col gap-8">
          <p className="text-md md:text-xl max-w-xl lg:max-w-md text-center lg:text-left">
            Get the markdown by crawling websites perfect for your AI agents to
            digest.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              to="/register"
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
              search={{ returnTo: undefined }}
            >
              Get Started
            </Link>
          </div>
        </section>
      </section>
      <div className="relative my-12 pointer-events-none">
        <img
          src={ImageLight}
          alt="Hero"
          className="w-full dark:hidden max-w-6xl h-auto rounded"
        />
        <img
          src={ImageDark}
          alt="Hero"
          className="w-full hidden dark:block max-w-6xl h-auto rounded"
        />
        <div className="max-md:hidden absolute bottom-0 left-0 h-12 lg:h-24 w-full bg-linear-to-b from-transparent to-background" />
      </div>
    </motion.div>
  );
}
