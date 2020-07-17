/**
 * Created by Chris Reed on 2/15/2017.
 */

import { Injectable } from "@angular/core";

import { LOG_LEVELS } from "../../../entities/enums";

import { environment } from "@env/environment";

interface ILoggingConfig {
  minConsoleLogLevel: number;
  minServerLogLevel: number;
}

@Injectable()
export class LoggingService {
  protected readonly CLASSNAME = "LoggingService";

  private _config: ILoggingConfig = null;

  constructor() {
    this._config = environment.logging;
  }

  public log(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.ALL) {
      // new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.ALL) {
      //TODO: Log to server
    }
  }

  public debug(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.DEBUG) {
      if (console.debug) console.debug(...messages);
      // else new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.DEBUG) {
      //TODO: Log to server
    }
  }

  public info(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.INFO) {
      if (console.info) console.info(...messages);
      // else new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.INFO) {
      //TODO: Log to server
    }
  }

  public warn(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.WARN) {
      if (console.warn) console.warn(...messages);
      // else new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.WARN) {
      //TODO: Log to server
    }
  }

  public error(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.ERROR) {
      if (console.error) console.error(...messages);
      // else new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.ERROR) {
      //TODO: Log to server
    }
  }

  public fatal(...messages) {
    if (!messages || !messages.length) return;

    if (this._config.minConsoleLogLevel <= LOG_LEVELS.FATAL) {
      if (console.error) console.error(...messages);
      // else new Object(); // console.log(...messages);
    }

    if (this._config.minServerLogLevel <= LOG_LEVELS.FATAL) {
      //TODO: Log to server
    }
  }
}
