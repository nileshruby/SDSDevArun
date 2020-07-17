interface Date {
  toShortTimeString: () => string;
}

Date.prototype.toShortTimeString = function(): string {
  let result: string;
  let strHours: string;
  let postfix = "am";
  if (this) {
    let hours = this.getHours();
    if (hours >= 12) {
      hours = hours % 12;
      postfix = "pm";
    }
    result = `${`${hours.toString().padStart(2, "0")}`}:${this.getMinutes()
      .toString()
      .padStart(2, "0")}:${this.getSeconds()
      .toString()
      .padStart(2, "0")}${postfix}`;
  } else {
    result = this;
  }

  return result;
};
