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
    const guild = client.guilds.cache.get('841760990637850675');
    if (!guild) {
      console.error('Guild not found');
      return res.status(404).json({ error: 'Guild not found' });
    }

    // List of role IDs to exclude
    const excludedRoleIds = [
      '1292243598024249427', '1290056548231544843', '1290055932755185705',
      '1290055681256194068', '1290055614034083880', '1290055526075338804',
      '1290062237049950208', '1199255228122419200', '1199255203061444641',
      '1200322521950584925', '1199255170207465472', '1199255078008262716',
      '1233102751160860672', '1219517641144664096', '841785402507395074',
      '1143423549999153172', '841785400552062996', '1174870269723156620',
      '1231069445628231741', '841760990637850675','890356658054778983', 
      '841785401332596747', '845379527004651572'
    ];

    // Fetch all members in the guild
    const members = await guild.members.fetch();

    // Filter and sort staff members
    const staffMembers = members.filter(member => 
      member.roles.cache.some(role => role.id === '868355191064379492')
    );

    const sortedStaffMembers = staffMembers.sort((a, b) => {
      const aHighestRole = a.roles.cache
        .filter(role => !excludedRoleIds.includes(role.id)) // Exclude roles
        .reduce((prev, current) => (prev.position > current.position) ? prev : current, {});
      const bHighestRole = b.roles.cache
        .filter(role => !excludedRoleIds.includes(role.id)) // Exclude roles
        .reduce((prev, current) => (prev.position > current.position) ? prev : current, {});
      return bHighestRole.position - aHighestRole.position;
    });

    // Map and sort roles for each member
    const staffData = sortedStaffMembers.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName || member.user.username,
      avatar: member.user.avatarURL(),
      roles: member.roles.cache
        .filter(role => !excludedRoleIds.includes(role.id)) // Exclude specified roles
        .sort((a, b) => b.position - a.position) // Sort roles by position (highest first)
        .map(role => ({
          id: role.id,
          name: role.name,
          position: role.position,
          color: `#${role.color.toString(16).padStart(6, '0')}` // Convert role color to hex string
        }))
    }));

    res.status(200).json(staffData);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/admin/check-roles', async (req, res) => {
  const { userId, guildId } = req.query;

  try {
      // Fetch the guild using the bot client
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
          return res.status(404).json({ error: 'Guild not found' });
      }

      // Fetch the member in the guild
      let member;
      try {
          member = await guild.members.fetch(userId);
      } catch (fetchError) {
          if (fetchError.code === 50001) { // Missing Access
              return res.status(404).json({ error: 'Member not found in guild' });
          }
          console.error('Error fetching member:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch member' });
      }

      // Check if the member has roles
      if (!member.roles || !member.roles.cache) {
          console.error('Member roles not available:', member);
          return res.status(500).json({ error: 'Member roles not available' });
      }

      console.log('Member roles:', member.roles.cache.map(role => role.id)); // Log roles

      // Check if the member has the specific role
      const hasAccessRole = member.roles.cache.some(role => role.id === '1206515346979430471');

      return res.status(200).json({ hasAccess: hasAccessRole });
  } catch (error) {
      console.error('Error fetching member roles:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
