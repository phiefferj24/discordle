import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CacheType, CommandInteraction, Interaction } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('wordle')
        .setDescription('Initialize either the daily wordle or a random wordle.')
        .addStringOption(new SlashCommandStringOption()
            .setChoices([
                ["daily", "daily"],
                ["random", "random"]
            ])
            .setRequired(true)
            .setName("type")
            .setDescription("Either 'daily' for today's wordle or 'random' for a random word.")
        )
}