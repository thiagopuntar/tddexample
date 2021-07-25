module.exports = class AgencyRepository {
  async findByLicense(id) {
    console.log(`Finding agency at database id: ${id}`);
  }

  async deleteAgency(id) {
    console.log(`Deleting agency id ${id}`);
  }

  async updateAgency(id, dataToUpdate) {
    console.log(`Updating agency id ${id} with data ${JSON.stringify(dataToUpdate)}`);
  }
};
