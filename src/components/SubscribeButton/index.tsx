import { useSession, signIn } from 'next-auth/client';

import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton(props: SubscribeButtonProps) {
  const { priceId } = props;
  const [session] = useSession();

  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }

    // Criação da checkout session
    // Onde podemos utilizar as credenciais secretas?
    // getServerSideProps (SSR)
    // getStaticProps (SSG)
    // API Routes
    try {
      console.log('Fazendo o subscribe...');
      const response = await api.post('/subscribe');
      console.log('response.data', response.data);
      const { sessionId } = response.data;

      const stripe = await getStripeJs();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  );
}
