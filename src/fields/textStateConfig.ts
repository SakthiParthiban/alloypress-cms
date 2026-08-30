export const textStateConfig = {
  color: {
    black: {
      label: 'Black',
      css: {
        color: '#111827',
      },
    },

    gray: {
      label: 'Gray',
      css: {
        color: '#6B7280',
      },
    },

    red: {
      label: 'Red',
      css: {
        color: '#DC2626',
      },
    },

    orange: {
      label: 'Orange',
      css: {
        color: '#EA580C',
      },
    },

    green: {
      label: 'Green',
      css: {
        color: '#16A34A',
      },
    },

    blue: {
      label: 'Blue',
      css: {
        color: '#2563EB',
      },
    },

    purple: {
      label: 'Purple',
      css: {
        color: '#9333EA',
      },
    },

    white: {
      label: 'White',
      css: {
        color: '#FFFFFF',
      },
    },
  },

    backgroundColor: {
    green: {
      label: 'Green Highlight',
      css: {
        'background-color': '#D9F99D',
      },
    },

    yellow: {
      label: 'Yellow Highlight',
      css: {
        'background-color': '#FEF9C3',
      },
    },

    blue: {
      label: 'Blue Highlight',
      css: {
        'background-color': '#DBEAFE',
      },
    },

    red: {
      label: 'Red Highlight',
      css: {
        'background-color': '#FEE2E2',
      },
    },

    gray: {
      label: 'Gray Highlight',
      css: {
        'background-color': '#F3F4F6',
      },
    },
  },

  fontFamily: {
    default: {
      label: 'Default',
      css: {
        'font-family': 'inherit',
      },
    },

    inter: {
      label: 'Inter',
      css: {
        'font-family': 'Inter, sans-serif',
      },
    },

    arial: {
      label: 'Arial',
      css: {
        'font-family': 'Arial, sans-serif',
      },
    },

    georgia: {
      label: 'Georgia',
      css: {
        'font-family': 'Georgia, serif',
      },
    },

    times: {
      label: 'Times New Roman',
      css: {
        'font-family': '"Times New Roman", serif',
      },
    },

    courier: {
      label: 'Courier New',
      css: {
        'font-family': '"Courier New", monospace',
      },
    },

    trebuchet: {
      label: 'Trebuchet MS',
      css: {
        'font-family': '"Trebuchet MS", sans-serif',
      },
    },
  },

  fontSize: {
    small: {
      label: 'Small',
      css: {
        'font-size': '14px',
      },
    },

    medium: {
      label: 'Normal',
      css: {
        'font-size': '16px',
      },
    },

    large: {
      label: 'Large',
      css: {
        'font-size': '20px',
      },
    },

    extraLarge: {
      label: 'Extra Large',
      css: {
        'font-size': '26px',
      },
    },

    huge: {
      label: 'Huge',
      css: {
        'font-size': '34px',
      },
    },
  },

  textStyle: {
    regular: {
      label: 'Normal',
      css: {
        'font-weight': '400',
        'font-style': 'normal',
      },
    },

    bold: {
      label: 'Bold',
      css: {
        'font-weight': '700',
      },
    },

    light: {
      label: 'Light',
      css: {
        'font-weight': '300',
      },
    },

    italic: {
      label: 'Italic',
      css: {
        'font-style': 'italic',
      },
    },
  },

  decoration: {
    none: {
      label: 'None',
      css: {
        'text-decoration': 'none',
      },
    },

    underline: {
      label: 'Underline',
      css: {
        'text-decoration': 'underline',
      },
    },

    lineThrough: {
      label: 'Strikethrough',
      css: {
        'text-decoration': 'line-through',
      },
    },
  },
} as const