
export class ModalService {
  protected readonly CLASSNAME = 'ModalService';

  private modals: any = {};

  public add(modal: any) {
    if(!modal || !modal.name)
      return;

    this.modals[modal.name] = modal;
  }

  public remove(name: string) {
    if(this.modals[name])
      delete this.modals[name];
  }

  public showModal(name: string) {
    Object.keys(this.modals)
      .forEach(key => {
        if(key === name && this.modals[key].open)
          this.modals[key].open();
        else
          this.modals[key].close();
      });
  }

  public close(name: string) {
    this.modals[name].close();
  }
}
