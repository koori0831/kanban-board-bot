const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// 데이터 디렉토리 생성
if (!fs.existsSync(config.dataPath)) {
    fs.mkdirSync(config.dataPath, { recursive: true });
}

// 명령어 로드 및 슬래시 명령어 배열
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    
    // 슬래시 명령어가 있는 경우에만 등록
    if (command.data) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else if (command.name) {
        // 기존 prefix 명령어 등록
        client.commands.set(command.name, command);
    }
}

client.once('ready', async () => {
    console.log(`${client.user.tag} 봇이 준비되었습니다!`);
    
    // 슬래시 명령어가 있는 경우에만 등록
    if (commands.length > 0) {
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        try {
            console.log('슬래시 명령어를 등록하는 중...');
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            
            console.log('슬래시 명령어가 성공적으로 등록되었습니다!');
        } catch (error) {
            console.error('슬래시 명령어 등록 중 오류:', error);
        }
    }
});

// 슬래시 명령어 처리
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorMessage = '명령어 실행 중 오류가 발생했습니다.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) return;

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('자동완성 오류:', error);
        }
    }
});

// 기존 prefix 명령어도 유지
client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // 슬래시 명령어와 prefix 명령어 구분
        if (command.executeMessage) {
            await command.executeMessage(message, args);
        } else if (command.execute && !command.data) {
            // 기존 방식의 prefix 명령어
            await command.execute(message, args);
        }
    } catch (error) {
        console.error(error);
        message.reply('명령어 실행 중 오류가 발생했습니다.');
    }
});

client.login(config.token);