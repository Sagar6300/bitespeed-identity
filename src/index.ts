import express, { Request, Response } from 'express';
import { PrismaClient, Contact } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Provide email or phoneNumber" });
  }

  // 1️⃣ Find matching contacts
  const contacts: Contact[] = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });

  let primaryContact: Contact;
  let secondaryContacts: Contact[] = [];

  if (contacts.length === 0) {
    // 2️⃣ No match → create new primary
    const newContact = await prisma.contact.create({
      data: { email, phoneNumber, linkPrecedence: 'primary' }
    });

    return res.json({
      contact: {
        primaryContactId: newContact.id,
        emails: [newContact.email].filter(Boolean),
        phoneNumbers: [newContact.phoneNumber].filter(Boolean),
        secondaryContactIds: []
      }
    });
  }

  // 3️⃣ There are matches → find primary
  primaryContact = contacts.find((c: Contact) => c.linkPrecedence === 'primary') || contacts[0];
  secondaryContacts = contacts.filter((c: Contact) => c.id !== primaryContact.id);

  // 4️⃣ If input has new info → add secondary contact
  const alreadyExists = contacts.some(
    (c: Contact) => c.email === email && c.phoneNumber === phoneNumber
  );

  if (!alreadyExists) {
    const newSecondary = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary'
      }
    });
    secondaryContacts.push(newSecondary);
  }

  // 5️⃣ Consolidate all related data
  const emails = [...new Set(
    [primaryContact.email, ...secondaryContacts.map((c: Contact) => c.email)].filter(Boolean)
  )];

  const phoneNumbers = [...new Set(
    [primaryContact.phoneNumber, ...secondaryContacts.map((c: Contact) => c.phoneNumber)].filter(Boolean)
  )];

  const secondaryContactIds = secondaryContacts.map((c: Contact) => c.id);

  res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
