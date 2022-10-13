import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  newCrowdFundingCreated
} from "../generated/CrowdSourcingFactory/CrowdSourcingFactory"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createnewCrowdFundingCreatedEvent(
  owner: Address,
  amount: BigInt,
  cloneAddress: Address,
  fundingCID: string
): newCrowdFundingCreated {
  let newCrowdFundingCreatedEvent = changetype<newCrowdFundingCreated>(
    newMockEvent()
  )

  newCrowdFundingCreatedEvent.parameters = new Array()

  newCrowdFundingCreatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  newCrowdFundingCreatedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  newCrowdFundingCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "cloneAddress",
      ethereum.Value.fromAddress(cloneAddress)
    )
  )
  newCrowdFundingCreatedEvent.parameters.push(
    new ethereum.EventParam("fundingCID", ethereum.Value.fromString(fundingCID))
  )

  return newCrowdFundingCreatedEvent
}
