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
        ),
    async execute(interaction: CommandInteraction<CacheType>, wordleEmbed) {
        await interaction.reply({ content: (interaction.options.getString('type') == "daily" ? `The daily wordle (${new Date().toDateString()})` : `A random wordle`), embeds: [wordleEmbed], ephemeral: true})
    }
}