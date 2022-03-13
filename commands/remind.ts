import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders'
import { CacheType, CommandInteraction, Interaction } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Reminds you of your last guess.')
}