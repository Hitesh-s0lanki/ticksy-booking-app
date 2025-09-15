import { Event as EventProto } from "@/gen/js-ts/event_pb";
import { PlainMessage } from "@bufbuild/protobuf";

export type Event = PlainMessage<EventProto>;
