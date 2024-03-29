import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { Session } from 'next-auth';
import Head from 'next/head';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function Post(props: PostProps) {
  const { post } = props;
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  );
}

interface SessionProps extends Session {
  activeSubscription: null | Object;
}

export const getServerSideProps: GetServerSideProps = async (props) => {
  const { req, params } = props;
  const { slug } = params;
  //   console.log('[slug].getServerSideProps.props.req: ', req);
  const session = (await getSession({ req })) as SessionProps;
  // console.log('[slug].getServerSideProps.session: ', session);

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prismic = getPrismicClient(req);

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content),
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
  };
};
