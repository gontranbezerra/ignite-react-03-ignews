import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../../services/prismic';

import styles from '../post.module.scss';

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}
interface SessionProps extends Session {
  activeSubscription: null | Object;
}

export default function PostPreview(props: PostPreviewProps) {
  const { post } = props;

  // Em páginas estáticas não tem como fazer checagem de session no getStaticProps
  const [_session] = useSession();
  const session = _session as SessionProps;
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe Now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // para que todas as páginas do preview sejam geradas no build
    // paths: [
    //   {
    //     params: { slug: 'upload-de-imagens-no-front-end-com-reactjs-e-context' },
    //   },
    // ],
    fallback: 'blocking', // true | false \ 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (props) => {
  const { params } = props;
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 4)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
