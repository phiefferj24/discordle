import { Client, Collection, CommandInteraction, Intents, Interaction, Message } from "discord.js"
import config from "./config.json"
import guess from "./commands/guess"
import { Routes } from "discord-api-types/v9"
import { REST } from "@discordjs/rest"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
})

client.once('ready', async () => {
    console.log(`${client.user.tag} ready!`)
})

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return
    await guess.execute(interaction)
})

const rest = new REST().setToken(config.token);

(async () => {
    await rest.put(Routes.applicationGuildCommands("952342452591796314", "952357049243676742"), { body: [guess.data] })
})()

client.login(config.token)

