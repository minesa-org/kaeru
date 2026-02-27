import { type ComponentCommand, type ModalSubmitInteraction } from '@minesa-org/mini-interaction'

const ping_modal: ComponentCommand = {
  customId: 'ping_modal',

  handler: async (interaction: ModalSubmitInteraction) => {
    const optionValue = interaction.getSelectMenuValues('ping_menu_modal')

    await interaction.reply({
      content: `You selected: ${optionValue}`
    })
  }
}

export default ping_modal
