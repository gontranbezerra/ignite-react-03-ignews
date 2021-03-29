// import { useRouter } from 'next/router';
import Link from 'next/link';

import { SignInButton } from '../SignInButton/index';

import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export function Header() {
  // const { asPath } = useRouter();

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />
        <nav>
          <ActiveLink href="/" activeClassName={styles.active}>
            {/* <a className={asPath === '/' ? styles.active : ''}>Home</a> */}
            <a>Home</a>
          </ActiveLink>
          {/* <Link href="/posts" prefetch> // prefetch precarregas as páginas */}
          <ActiveLink href="/posts" activeClassName={styles.active}>
            {/* <a className={asPath === '/posts' ? styles.active : ''}>Posts</a> */}
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}
