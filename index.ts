import { Client, Collection, CommandInteraction, Intents, Interaction, Message } from "discord.js"
import config from "./config.json"
import guess from "./commands/guess"
import wordle from "./commands/wordle"
import { Routes } from "discord-api-types/v9"
import { REST } from "@discordjs/rest"
import allWords from "./allWords.json"
import allowedWords from "./allowedWords.json"
import cancel from "./commands/cancel"
import remind from "./commands/remind"

type WordleSession = {user: string, word: string, attempts: string[], number: number}

const wordleSessions: WordleSession[] = []

const firstDay = new Date("6/20/2021")

function getSession(user: string): WordleSession {
    for(const session of wordleSessions) {
        if(session.user === user) return session
    }
    return undefined
}
function addToAttempts(user: string, word: string) {
    for(let i = 0; i < wordleSessions.length; i++) {
        if(wordleSessions[i].user === user) {
            wordleSessions[i].attempts = [...wordleSessions[i].attempts, word]
            return
        }
    }
}
function removeSession(user: string) {
    for(let i = 0; i < wordleSessions.length; i++) {
        if(wordleSessions[i].user === user) {
            wordleSessions.splice(i, 1)
            return
        }
    }
}

function getDayNumber() {
    return Math.ceil((new Date().getTime() - firstDay.getTime())/86400000)%allowedWords.length
}

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
    if(interaction.commandName === "guess") {
        const session = getSession(interaction.user.id)
        if(session === undefined) {
            await interaction.reply({ content: "You are not playing a wordle game! Start one with `/wordle daily` or `/wordle random`.", ephemeral: true })
            return
        }
        if(interaction.options.getString("guess").length !== 5 || !(allWords.includes(interaction.options.getString("guess")) || allowedWords.includes(interaction.options.getString("guess")))) {
            await interaction.reply({ content: `Invalid guess!`, ephemeral: true })
            return
        }
        const guessWord = await guess.guess(interaction, session.word, session.attempts, session.number)
        if(guessWord === "") removeSession(interaction.user.id)
        else if(guessWord !== undefined) addToAttempts(interaction.user.id, guessWord)
    }
    else if(interaction.commandName === "wordle") {
        const session = getSession(interaction.user.id)
        if(session !== undefined) {
            await interaction.reply({ content: "You are already playing a wordle game! Guess a word with `/guess`, remind yourself of your last guess with `/remind`, or cancel your game with `/cancel`.", ephemeral: true })
            return
        }
        let word = ""
        if(interaction.options.getString("type") === "daily") word = allowedWords[getDayNumber()]
        else word = allowedWords[Math.floor(Math.random()*allowedWords.length)]
        wordleSessions.push({
            user: interaction.user.id,
            word: word,
            attempts: [],
            number: interaction.options.getString("type") === "daily" ? getDayNumber() : -1
        })
        await interaction.reply({ content: `Started ${interaction.options.getString("type")} wordle! Make your first guess with \`/guess\`.`, ephemeral: true})
    }
    else if(interaction.commandName === "remind") {
        const session = getSession(interaction.user.id)
        if(session === undefined) {
            await interaction.reply({ content: "You are not playing a wordle game! Start one with `/wordle daily` or `/wordle random`.", ephemeral: true })
            return
        }
        await interaction.reply({ content: guess.buildWordleMessage(session.attempts, session.word), ephemeral: true })
    }
    else if(interaction.commandName === "cancel") {
        const session = getSession(interaction.user.id)
        if(session === undefined) {
            await interaction.reply({ content: "You are not playing a wordle game! Start one with `/wordle daily` or `/wordle random`.", ephemeral: true })
            return
        }
        removeSession(interaction.user.id)
        await interaction.reply({ content: "Session cleared! Start a new one with `/wordle daily` or `/wordle random`.", ephemeral: true })
    }
})

const rest = new REST().setToken(config.token);

(async () => {
    await rest.put(Routes.applicationGuildCommands("952342452591796314", "952357049243676742"), { body: [guess.data, wordle.data, remind.data, cancel.data] })
})()

client.login(config.token).then(() => {
    client.user.setActivity("Wordle", {
        type: "PLAYING"
    })
})

