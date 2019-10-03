//@ts-check

import { bindable } from 'aurelia-framework';
import {
  fetchListTarotCards,
  apiAddTarotCard,
  apiUpdateTarotExplanation,
  apiAddTarotCardExplanation,
  apiDeleteTarotCard,
} from './tarot.gateway';
import { refreshJumpable } from 'components/features/jumpable/jumpable.js';
import hotkeys from 'hotkeys-js';
import { acceptEditedTarotShortcut, tarotShortcutScope } from './tarot-shortcuts';


import './sb-tarot.less';

export class SbTarot {
  @bindable value = 'SbTarot';

  selectedCard;

  selectedExplanation;

  tarotCards;

  async bind() {
    const tarotCards = await fetchListTarotCards();
    this.tarotCards = tarotCards;
    this.selectedCard = tarotCards[4];
    this.selectedExplanation = this.selectedCard.explanation[0];
  }

  attached() {
    refreshJumpable();
  }

  // View
  selectCard(tarotCard) {
    this.selectedCard = tarotCard;
  }

  selectExplanation(tarotCardExplanation) {
    this.selectedExplanation = tarotCardExplanation;
  }


  // API

  async addTarotCard(tarotCardName) {
    if (!tarotCardName) return console.error('No empty input.');
    const newTarotCard = await apiAddTarotCard({
      name: tarotCardName,
    });
    this.tarotCards.push(newTarotCard);
    // Reset input field
    this.tarotCardName = '';
  }

  async addTarotExplanation() {
    const newExplanation = await apiAddTarotCardExplanation('foo', this.selectedCard.id);
    this.selectedCard.explanation.push(newExplanation);
  }

  async removeTarotCard(todoId) {
    await apiDeleteTarotCard(todoId);
    this.tarotCards = this.tarotCards.filter(item => item.id !== todoId);
  }

  async toggleTodoItemDone(todoId, checked) {
    await apiUpdateTodoItemDone(todoId, checked);
  }

  async updateTodoItem(todoItem) {
    await apiUpdateTodoItem(todoItem.id, {
      attribute: 'text',
      value: todoItem.text,
    });
  }

  updateTarotCardExplanationAfterShortcut(selectedExplanation, attribute) {
    this.previousScope = hotkeys.getScope();
    hotkeys.setScope(tarotShortcutScope);

    hotkeys(acceptEditedTarotShortcut, tarotShortcutScope, async() => {
      await apiUpdateTarotExplanation(this.selectedExplanation.id, {
        attribute,
        value: this.selectedExplanation[attribute],
      });
      hotkeys.setScope(this.previousScope);
      // @ts-ignore
      document.activeElement.blur();
      hotkeys.unbind('ctrl+enter', tarotShortcutScope);
    });
  }

  removeUpdateCardExplanationShortcut() {
    hotkeys.unbind('ctrl+enter', tarotShortcutScope);
    hotkeys.setScope(this.previousScope);
  }
}
