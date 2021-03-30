import { useSession, signIn } from 'next-auth/client';
import { Session } from 'next-auth';
import { useRouter } from 'next/router';

import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';

import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}
interface SessionProps extends Session {
  activeSubscription: null | Object;
}

export function SubscribeButton(props: SubscribeButtonProps) {
  const { priceId } = props;
  const [_session] = useSession();
  const session = _session as SessionProps;
  const router = useRouter();

  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }

    if (session.activeSubscription) {
      router.push('/posts');
      return;
    }
    // Criação da checkout session
    // Onde podemos utilizar as credenciais secretas?
    // getServerSideProps (SSR)
    // getStaticProps (SSG)
    // API Routes
    try {
      // console.log('Fazendo o subscribe...');
      const response = await api.post('/subscribe');
      // console.log('response.data', response.data);
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
