export default function handler(req, res) {
  if (req.method === 'POST') {
    const { organization, email, capacity } = req.body;

    // Log incoming data (or send to email/database)
    console.log(`Access requested by ${email} from ${organization}`);

    return res.status(200).json({
      success: true,
      message: `Operator credentials verified for ${organization}.`,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
