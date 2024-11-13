import { db } from '@vercel/postgres';
import { kv } from '@vercel/kv';
import { arrayBufferToBase64, stringToArrayBuffer } from '../lib/base64';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { email, username, password } = await request.json();

    // Hash the password using SHA-256
    const hash = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(username + password));
    const hashed64 = arrayBufferToBase64(hash);

    // Check if the user already exists
    const client = await db.connect();
    const {rowCount, rows} = await client.sql`SELECT * FROM users WHERE username = ${username} OR email = ${email}`;
    // const userCheckResult = await userCheckQuery.fetch();

    if (rowCount > 0) {
      const error = { code: 'CONFLICT', message: 'Un utilisateur avec le meme email ou pseudo existe deja' };
      return new Response(JSON.stringify(error), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    const external_id = crypto.randomUUID().toString();
    // If user doesn't exist, proceed with registration
    const res = await client.sql`
      INSERT INTO users (username, email, password, created_on, external_id)
      VALUES (${username}, ${email}, ${hashed64}, now(), ${external_id})
      RETURNING user_id, external_id;
    `;

    if (res.rowCount===1){
        return new Response(JSON.stringify({status:"User created",}),{status:200});
    }

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
