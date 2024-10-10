const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();
const port = 5000;

app.use(cors());

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login('MTIyNDc4MTk0MTM1NDUyODkxMA.GUBfD8.KkMZTpi1yHigN_Sjy4CNPAJs8Xy5mNgPfca_L4');

app.get('/roles', async (req, res) => {
  try {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {
      console.error('Guild not found');
      return res.status(404).json({ error: 'Guild not found' });
    }

    // Fetch all members in the guild
    const members = await guild.members.fetch();
    console.log('Fetched members:', members); // Log fetched members

    // Filter and sort staff members
    const staffMembers = members.filter(member => 
      member.roles.cache.some(role => role.id === STAFF_ROLE_ID)
    );

    console.log('Staff members:', staffMembers); // Log staff members found

    const sortedStaffMembers = staffMembers.sort((a, b) => {
      const aHighestRole = a.roles.cache.reduce((prev, current) => (prev.position > current.position) ? prev : current);
      const bHighestRole = b.roles.cache.reduce((prev, current) => (prev.position > current.position) ? prev : current);
      return bHighestRole.position - aHighestRole.position;
    });

    // Map the sorted members to return only necessary information
    const staffData = sortedStaffMembers.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName, // Change to displayName
      avatar: member.user.displayAvatarURL(), // Change to displayAvatarURL
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        position: role.position
      }))
    }));

    res.status(200).json(staffData);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
