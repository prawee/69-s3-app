module.exports = {
  beforeCreate(event: any) {
    const { data } = event.params;
    const mobile = data?.mobile;

    if (typeof mobile === 'string') {
      event.params.data.mobile = Buffer.from(mobile).toString('base64');
    }
  },

  beforeUpdate(event: any) {
    const { data } = event.params;
    const mobile = data?.mobile;

    if (typeof mobile === 'string') {
      event.params.data.mobile = Buffer.from(mobile).toString('base64');
    }
  },

  afterCreate(event: any) {
  },

  async afterFindOne(event: any) {
    const { result } = event;

    if (result) {
      const mobile = result?.mobile;

      if (typeof mobile === 'string') {
        try {
          const decoded = Buffer.from(mobile, 'base64').toString('utf-8');
          result.mobile = decoded.slice(-3) === 'xxx'
            ? decoded
            : decoded.slice(0, -3) + 'xxx';
        } catch {
          // ignore invalid base64
        }
      }
    }
  },

  async afterFindMany(event: any) {
    const { result } = event;

    for (const entry of result) {
      const mobile = entry?.mobile;

      if (typeof mobile === 'string') {
        try {
          const decoded = Buffer.from(mobile, 'base64').toString('utf-8');
          entry.mobile = decoded.slice(-3) === 'xxx'
            ? decoded
            : decoded.slice(0, -3) + 'xxx';
        } catch {
          // ignore invalid base64
        }
      }
    }
  },
};