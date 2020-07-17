export interface INavMenuConfig {
  title: string;
  titleIconClass: string;
  value: string;
  items: INavMenuItem[];
}

export interface INavMenuItem {
  id?: number;
  order: number;
  text: string;
  value: string;
  isSection?: boolean;
  children?: INavMenuItem[];
}
