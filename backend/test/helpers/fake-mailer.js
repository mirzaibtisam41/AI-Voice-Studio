export function createFakeMailer() {
  const sentEmails = [];

  return {
    sentEmails,

    async sendEmail(email) {
      sentEmails.push(email);

      return true;
    },

    findLastEmailTo(address) {
      return sentEmails.findLast((email) => email.to === address) ?? null;
    },

    readTokenFromLastEmailTo(address) {
      const email = this.findLastEmailTo(address);

      return email?.text.match(/token=([A-Za-z0-9_-]+)/)?.[1] ?? null;
    },
  };
}
