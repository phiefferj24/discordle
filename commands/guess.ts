import { SlashCommandBuilder, SlashCommandStringOption, Embed } from '@discordjs/builders'
import { CacheType, CommandInteraction } from 'discord.js'
import letters from '../letters.json'

function calculateColors(attempt: string, actual: string): number[] {
    //0: gray, 1: yellow, 2: green
    const colors: number[] = [0, 0, 0, 0, 0]
    for(let i = 0; i < attempt.length; i++) {
        if(attempt.charAt(i) === actual.charAt(i)) {
            colors[i] = 2
            actual = actual.substring(0, i) + " " + actual.substring(i+1)
            attempt = attempt.substring(0, i) + " " + attempt.substring(i+1)
        }
    } // first pass for greens
    for(let i = 0; i < attempt.length; i++) {
        for(let j = 0; j < actual.length; j++) {
            if(attempt.charAt(i) !== " " && attempt.charAt(i) === actual.charAt(j)) {
                colors[i] = 1
                attempt = attempt.substring(0, i) + " " + attempt.substring(i+1)
                actual = actual.substring(0, j) + " " + actual.substring(j+1)
            }
        }
    }
    return colors
}

function buildWordleMessage(attempts: string[], actual: string): string {
    let message: string = ""
    for(const attempt of attempts) {
        const wordColors = calculateColors(attempt, actual)
        for(let i = 0; i < wordColors.length; i++) {
            switch(wordColors[i]) {
                case 0: message += letters.gray[attempt.charAt(i)]; break
                case 1: message += letters.yellow[attempt.charAt(i)]; break
                case 2: message += letters.green[attempt.charAt(i)]; break
            }
        }
        message += "\n"
    }
    return message
}

function simpleColors(attempts: string[], word: string, number: number): string {
    let message = `**${number === -1 ? `Random wordle (${word})` : `Wordle ${number}`}: ${attempts[attempts.length-1]===word?attempts.length:"X"}/6**\n`
    for(const attempt of attempts) {
        const colors = calculateColors(attempt, word)
        for(const color of colors) {
            switch(color) {
                case 0: message += "⬜️"; break
                case 1: message += "🟨"; break
                case 2: message += "🟩"; break
            }
        }
        message += "\n"
    }
    return message
}

export default {
    data: new SlashCommandBuilder()
        .setName("guess")
        .setDescription("Make a guess for your current wordle game.")
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("guess")
            .setDescription("The word to guess")
        ),
    async guess(interaction: CommandInteraction<CacheType>, word: string, attempts: string[], number: number): Promise<string> {
        const guess = interaction.options.getString("guess")
        const embeds: Embed[] = []
        if(attempts.length == 5 && word !== guess) embeds.push(new Embed().setTitle(`You didn't guess the word. The word was "${word}".`).setDescription(simpleColors([...attempts, guess], word, number)))
        if(word === guess) embeds.push(new Embed().setTitle(`You got it! The word was "${word}".`).setDescription(simpleColors([...attempts, guess], word, number)))
        await interaction.reply({ content: buildWordleMessage([...attempts, guess], word), embeds: embeds, ephemeral: true })
        return embeds.length > 0 ? "" : guess
    },
    buildWordleMessage
}