import { GetServerSideProps } from 'next';

import Head from 'next/head';

import { SubscribeButton } from '../components/SubscribeButton/index';
import { stripe } from '../services/stripe';

import styles from './home.module.scss';

interface HomeProduct {
  product: {
    priceId: string;
    amount: string;
  };
}

export default function Home(props: HomeProduct) {
  const { product } = props;
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏🏻 Hey, welcome</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>

        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

// função padrão para rodar no Nodejs dentro do Next no lado servidor
export const getServerSideProps: GetServerSideProps = async () => {
  // const price = await stripe.prices.retrieve('price_1IYuZMKL9ACPD24bzlYMDh9U', {
  //   expand: ['product'], // pra trazer mais informaões
  // });
  const price = await stripe.prices.retrieve('price_1IYuZMKL9ACPD24bzlYMDh9U');

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
  };
};
