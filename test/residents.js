const Residents = artifacts.require("./Residents.sol");

const {
  BN,
  time,
  constants,
  balance,
  ether,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');

contract("Residents", function (_accounts) {
  const OWNER = _accounts[0];

  const RESIDENT_0_ADDRESS = _accounts[1];
  const RESIDENT_1_ADDRESS = _accounts[2];

  let residents;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    residents = await Residents.new();
  });

  describe("Add resident", () => {
    it("should fail if not owner", async () => {
      await expectRevert(residents.addResident(RESIDENT_0_ADDRESS, {
        from: RESIDENT_0_ADDRESS
      }), "Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner");
    });

    it("should fail if resident is present", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await expectRevert(residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      }), "Resident exists");
    });

    it("should increase residents amount", async () => {
      const prevAmount = await residents.residentAmount.call();

      //  1
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });
      assert.equal((await residents.residentAmount.call()).sub(prevAmount), 1, "wrong amount after 1");

      //  2
      await residents.addResident(RESIDENT_1_ADDRESS, {
        from: OWNER
      });
      assert.equal((await residents.residentAmount.call()).sub(prevAmount), 2, "wrong amount after 2");
    });

    it("should create resident obj with correct address, but other empty fields", async () => {
      //  1
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });
      let resident_0 = await residents.residents.call(RESIDENT_0_ADDRESS);
      assert.equal(resident_0.addr, RESIDENT_0_ADDRESS, "wrong address");
      assert.equal(resident_0.id, 0, "wrong id");
      assert.equal(resident_0.fullName, "", "wrong fullName");
      assert.equal(resident_0.email, "", "wrong email");
      assert.equal(resident_0.password, "", "wrong password");
      assert.equal((await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS)).length, 0, "wrong realtyIds");

      //  2
      await residents.addResident(RESIDENT_1_ADDRESS, {
        from: OWNER
      });
      let resident_1 = await residents.residents.call(RESIDENT_1_ADDRESS);
      assert.equal(resident_1.addr, RESIDENT_1_ADDRESS, "wrong address 1");
      assert.equal(resident_1.id, 1, "wrong id 1");
      assert.equal(resident_1.fullName, "", "wrong fullName 1");
      assert.equal(resident_1.email, "", "wrong email 1");
      assert.equal(resident_.password, "", "wrong password 1");
      assert.equal((await residents.realtyIdsForResident.call(RESIDENT_1_ADDRESS)).length, 0, "wrong realtyIds 1");
    });
  });

  describe("Update resident details", () => {
    const RESIDENT_0_FULLNAME = "RESIDENT_0_FULLNAME";
    const RESIDENT_0_EMAIL = "RESIDENT_0_EMAIL@gmail.com";
    const RESIDENT_0_PASSWORD = "RESIDENT_0_PASSWORD";

    it("should fail if not correct resident - no such resident", async () => {
      await residents.addResident(RESIDENT_1_ADDRESS, {
        from: OWNER
      });

      await expectRevert(residents.updateResidentDetails(RESIDENT_0_FULLNAME, RESIDENT_0_EMAIL, RESIDENT_0_PASSWORD, {
        from: RESIDENT_0_ADDRESS
      }), "Wrong resident");
    });

    it("should update obj with correct details", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await residents.updateResidentDetails(RESIDENT_0_FULLNAME, RESIDENT_0_EMAIL, RESIDENT_0_PASSWORD, {
        from: RESIDENT_0_ADDRESS
      });
      let resident_0 = await residents.residents.call(RESIDENT_0_ADDRESS);
      assert.equal(resident_0.id, 0, "wrong id");
      assert.equal(resident_0.addr, RESIDENT_0_ADDRESS, "wrong address");
      assert.equal(resident_0.fullName, RESIDENT_0_FULLNAME, "wrong fullName");
      assert.equal(resident_0.email, RESIDENT_0_EMAIL, "wrong email");
      assert.equal(resident_0.password, RESIDENT_0_PASSWORD, "wrong password");
    });
  });

  describe("Realty for resident", async () => {
    it("should fail if not owner", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await expectRevert(residents.addResidentRealty(RESIDENT_0_ADDRESS, 111, {
        from: RESIDENT_0_ADDRESS
      }), "Ownable: caller is not the owner");
    });

    it("should fail if no resident with such Ethereum address", async () => {
      await expectRevert(residents.addResidentRealty(RESIDENT_0_ADDRESS, 111, {
        from: OWNER
      }), "No such resident");
    });

    it("should add realty id", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      await residents.addResidentRealty(RESIDENT_0_ADDRESS, 111, {
        from: OWNER
      });

      assert.equal(0, (await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS))[0].cmp(new BN(111)), "wrong realty ids after push id");
    });

    it("should return correct realty ids", async () => {
      await residents.addResident(RESIDENT_0_ADDRESS, {
        from: OWNER
      });

      //  1
      await residents.addResidentRealty(RESIDENT_0_ADDRESS, 111, {
        from: OWNER
      });
      assert.equal(0, (await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS))[0].cmp(new BN(111)), "wrong realty ids after push id");

      //  2
      await residents.addResidentRealty(RESIDENT_0_ADDRESS, 222, {
        from: OWNER
      });
      assert.equal(0, (await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS))[0].cmp(new BN(111)), "wrong realty ids after push id - 0");
      assert.equal(0, (await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS))[1].cmp(new BN(222)), "wrong realty ids after push id - 1");

      //  3
      await residents.addResidentRealty(RESIDENT_0_ADDRESS, 333, {
        from: OWNER
      });
      assert.equal(0, (await residents.realtyIdsForResident.call(RESIDENT_0_ADDRESS))[2].cmp(new BN(333)), "wrong realty ids after push id - 2");
    });
  });

});