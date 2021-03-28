import { query as q } from 'faunadb';

import { fauna } from '../../../services/fauna';
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  // Buscar o usuário no FaunaDB com o ID {stripe_customer_id}
  // Salvar os dados da subscription do usuário no FaunaDB
  //   console.log('subscriptionId: ', subscriptionId, 'customerId: ', customerId);
  // Result: subscriptionId:  sub_JCSQgY39nPrAmk customerId:  cus_JC8Uvnmvogza37

  const userRef = await fauna.query(
    q.Select('ref', q.Get(q.Match(q.Index('user_by_stripe_customer_id'), customerId)))
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subsciptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
  };

  if (createAction) {
    await fauna.query(q.Create(q.Collection('subscriptions'), { data: subsciptionData }));
  } else {
    await fauna.query(
      q.Replace(q.Select('ref', q.Get(q.Match(q.Index('subscription_by_id'), subscriptionId))), {
        data: subsciptionData,
      })
    );
  }
}
