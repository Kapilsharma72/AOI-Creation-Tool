declare module 'leaflet' {
  namespace Control {
    interface DrawOptions {
      position?: string;
      draw?: any;
      edit?: any;
    }

    class Draw extends Control {
      constructor(options?: DrawOptions);
    }
  }

  namespace Draw {
    interface DrawOptions {
      icon?: any;
      zIndexOffset?: number;
      shapeOptions?: any;
      repeatMode?: boolean;
    }

    class DrawPolygon extends Handler {
      constructor(map: Map, options?: DrawOptions);
    }

    // Add other draw handlers as needed
  }

  interface MapOptions {
    drawControl?: boolean;
  }

  interface Map {
    addControl(control: Control): this;
    removeControl(control: Control): this;
    on(event: string, callback: (e: any) => void, context?: any): this;
    off(event: string, callback?: (e: any) => void, context?: any): this;
  }

  const Draw: {
    new (options?: Control.DrawOptions): Control.Draw;
  };

  namespace Control {
    interface DrawConstructor {
      new (options?: Control.DrawOptions): Control.Draw;
    }
  }
}