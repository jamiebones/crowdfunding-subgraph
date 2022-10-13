import { Donors, Campaign, CampaignCreator, Milestone } from "../generated/schema";
import { CrowdFundingContract } from "../generated/templates"
import { fundsDonated, fundsWithdrawn, milestoneCreated, milestoneRejected } from "../generated/templates/CrowdFundingContract/CrowdFundingContract"
import { newCrowdFundingCreated } from "../generated/CrowdSourcingFactory/CrowdSourcingFactory"
import { ipfs, json, BigInt } from "@graphprotocol/graph-ts";
import { integer } from "@protofire/subgraph-toolkit";


export function handlenewCrowdFundingCreated(event: newCrowdFundingCreated):void{
  let newCampaign = Campaign.load(event.params.cloneAddress.toHexString());
  let campaignCreator = CampaignCreator.load(event.params.owner.toHexString());
  if ( newCampaign === null ){
    newCampaign = new Campaign(event.params.cloneAddress.toHexString());
    let metadata = ipfs.cat(event.params.fundingCID + "/data.json");
    newCampaign.campaignCID = event.params.fundingCID;
    if ( metadata ){
      const value = json.fromBytes(metadata).toObject();
      const details = value.get("details");

      if ( details ){
        newCampaign.details = details.toString();
      }
    }
    newCampaign.owner = event.params.owner.toHexString();
    newCampaign.dateCreated = event.block.timestamp;
    newCampaign.amountSought = event.params.amount;
    newCampaign.campaignRunning = true;
  }
  if (campaignCreator === null){
    campaignCreator = new CampaignCreator(event.params.owner.toHexString());
    campaignCreator.fundingGiven = integer.ZERO;
    campaignCreator.fundingWithdrawn = integer.ZERO; 
}

 
  CrowdFundingContract.create(event.params.cloneAddress);

  newCampaign.save();
  campaignCreator.save();
}



export function handleFundsDonated(event: fundsDonated ):void {
  //const {amount, date, donor } = event.params
  //get the campain we are donating to
  const campaign = Campaign.load(event.transaction.to!.toHexString());
    if ( campaign ){
      //we save the donation in the Donor entity
      const newDonor = new Donors(event.transaction.hash.toHexString().concat("-").concat(event.transaction.from.toHexString()))
      newDonor.amount = event.params.amount;
      newDonor.campaign = campaign.id;
      newDonor.donorAddress = event.params.donor;
      newDonor.date = event.params.date;
      newDonor.save();
  
      //get the campaignCreator and add the donation to the campainCreator
      const campaignCreator = CampaignCreator.load(campaign.owner);
      if ( campaignCreator && campaignCreator.fundingGiven ){
        campaignCreator.fundingGiven = campaignCreator.fundingGiven!.plus(event.params.amount);
        campaignCreator.save();
      }
    }

  

 
}

export function handleFundsWithdrawn(event: fundsWithdrawn):void {
   let campaignCreator = CampaignCreator.load(event.params.owner.toHexString());
   if ( campaignCreator && campaignCreator.fundingWithdrawn){
     //increment the amount already withdrawan
     const totalWithdrawal = campaignCreator.fundingWithdrawn!.plus((event.params.amount))
     campaignCreator.fundingWithdrawn = totalWithdrawal;
     campaignCreator.save();
   }

   //set the current milestone to Approved
   //load the milestone and set it to Approved
    let campaign = Campaign.load((event.transaction.to!.toHexString()))
   
   if ( campaign && campaign.currentMilestone ){
      const currentMilestoneId = campaign.currentMilestone;
      //load the milestone
      const milestone = Milestone.load(currentMilestoneId!);
      if ( milestone && milestone.milestonestatus === "Pending" ){
        //check if the milestonestatus is pending
        //update it to Approved
        milestone.milestonestatus = "Approved";
        milestone.save();
      }
     }
   
}

export function handleMilestoneCreated(event: milestoneCreated):void {
  const newMilestone = new Milestone(event.transaction.hash.toHexString().concat("-").concat(event.transaction.from.toHexString()))
    const campaign = Campaign.load(event.transaction.to!.toHexString());
    if ( campaign ){
      newMilestone.campaign = campaign.id;
      newMilestone.milestonestatus = "Pending";
      newMilestone.milestoneCID = event.params.milestoneCID;
      let metadata = ipfs.cat(event.params.milestoneCID + "/data.json");
      if ( metadata ){
        const value = json.fromBytes(metadata).toObject();
        const details = value.get("details");
  
        if ( details ){
          newMilestone.details = details.toString();
        }
      }
      newMilestone.periodToVote = event.params.period;
      newMilestone.dateCreated = event.params.datecreated;
     
      newMilestone.save();
       //update the campaign with the current milestone
       campaign.currentMilestone = newMilestone.id;
       campaign.save()
    }
  


}


export function handleMilestoneRejected(event: milestoneRejected):void{
  const campaign = Campaign.load(event.transaction.to!.toHexString())
  if ( campaign && campaign.currentMilestone){
   const currentMilestoneId = campaign.currentMilestone
     //load the milestone
     const milestone = Milestone.load(currentMilestoneId!);
     if ( milestone && milestone.milestonestatus === "Pending" ){
       //check if the milestonestatus is pending
       //update it to Approved
       milestone.milestonestatus = "Rejected";
       milestone.save();
     }
   
  }

}