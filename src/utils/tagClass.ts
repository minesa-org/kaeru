import { Guild, IServerTag } from "../models/guild.model.js";
import { IUserTag, User } from "../models/user.model.js";

class TagManager {
	async getUserTags(userId: string): Promise<IUserTag[]> {
		const user = await User.findOne({ userId });
		return user?.tags || [];
	}

	async getServerTags(serverId: string): Promise<IServerTag[]> {
		const guild = await Guild.findOne({ guildId: serverId });
		return guild?.tags || [];
	}

	async getAllUserTags(userId: string, serverId?: string): Promise<(IUserTag | IServerTag)[]> {
		const userTags = await this.getUserTags(userId);
		const serverTags = serverId ? await this.getServerTags(serverId) : [];
		return [...userTags, ...serverTags];
	}

	async createTag(
		name: string,
		content: string,
		userId: string,
		serverId?: string,
	): Promise<{ success: boolean; message: string }> {
		const isServer = !!serverId;

		if (isServer) {
			const guild = await Guild.findOne({ guildId: serverId });
			if (!guild) {
				await Guild.create({ guildId: serverId, tags: [] });
			}

			const serverTags = await this.getServerTags(serverId);
			if (serverTags.length >= 10) {
				return { success: false, message: "Server tag limit reached (10)" };
			}

			if (serverTags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
				return { success: false, message: "Tag name already exists" };
			}

			await Guild.updateOne(
				{ guildId: serverId },
				{ $push: { tags: { name, content, userId, createdAt: new Date() } } },
			);
			return { success: true, message: `Server tag "${name}" created` };
		} else {
			let user = await User.findOne({ userId });
			if (!user) {
				user = await User.create({ userId, tags: [] });
			}

			const userTags = await this.getUserTags(userId);
			if (userTags.length >= 5) {
				return { success: false, message: "User tag limit reached (5)" };
			}

			if (userTags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
				return { success: false, message: "Tag name already exists" };
			}

			await User.updateOne(
				{ userId },
				{ $push: { tags: { name, content, createdAt: new Date() } } },
			);
			return { success: true, message: `User tag "${name}" created` };
		}
	}

	async getTag(
		name: string,
		userId: string,
		serverId?: string,
	): Promise<{ tag: IUserTag | IServerTag; isServer: boolean } | null> {
		const userTags = await this.getUserTags(userId);
		const userTag = userTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());

		if (userTag) return { tag: userTag, isServer: false };

		if (serverId) {
			const serverTags = await this.getServerTags(serverId);
			const serverTag = serverTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
			if (serverTag) return { tag: serverTag, isServer: true };
		}

		return null;
	}

	async deleteTag(
  name: string,
  userId: string,
  serverId?: string,
): Promise<{ success: boolean; message: string }> {
  if (!serverId) {
    const user = await User.findOne({ userId });
    if (!user) {
      return { success: false, message: "No tags found for this user" };
    }

    const beforeCount = user.tags.length;
    user.tags = user.tags.filter(
      (tag) => tag.name.toLowerCase() !== name.toLowerCase(),
    );

    if (user.tags.length === beforeCount) {
      return { success: false, message: "Tag not found" };
    }

    await user.save();
    return { success: true, message: `User tag "${name}" deleted` };
  }

  const guild = await Guild.findOne({ guildId: serverId });
  if (!guild) {
    return { success: false, message: "No tags found for this server" };
  }

  const beforeCount = guild.tags.length;
  guild.tags = guild.tags.filter(
    (tag) =>
      !(
        tag.name.toLowerCase() === name.toLowerCase() &&
        tag.userId === userId
      ),
  );

  if (guild.tags.length === beforeCount) {
    return {
      success: false,
      message: "Tag not found or no permission to delete",
    };
  }

  await guild.save();
  return { success: true, message: `Server tag "${name}" deleted` };
}
}

export const tagManager = new TagManager();
