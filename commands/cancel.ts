import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CacheType, CommandInteraction, Interaction } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription('Cancels your current wordle session.')
}