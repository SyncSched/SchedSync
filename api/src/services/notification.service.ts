import { PrismaClient } from "@prisma/client";
import { BadUserInputError } from '../errors';
import { sendEmail } from "../utils/email";
import axios from "axios";

const prisma = new PrismaClient();

export const getUpcomingNotifications = async (userId: string) => {
    const now = new Date();
    return await prisma.taskNotification.findMany({
        where: {
            userId,
            status: "pending"
        },
        include: {
            task: {
                select: {
                    id: true,
                    name: true,
                    time: true,
                    duration: true
                }
            }
        },
        orderBy: {
            notifyAt: 'asc'
        }
    });
};

export const updateNotificationTime = async (
    notificationId: string,
    userId: string,
    newNotifyAt: Date
) => {
    // First verify the notification belongs to the user
    const notification = await prisma.taskNotification.findFirst({
        where: {
            id: notificationId,
            userId
        }
    });

    if (!notification) {
        throw new BadUserInputError({
            message: 'Notification not found or unauthorized'
        });
    }

    return await prisma.taskNotification.update({
        where: {
            id: notificationId
        },
        data: {
            notifyAt: newNotifyAt
        },
        include: {
            task: {
                select: {
                    id: true,
                    name: true,
                    time: true,
                    duration: true
                }
            }
        }
    });
};

export const deleteNotification = async (
    notificationId: string,
    userId: string
) => {
    // First verify the notification belongs to the user
    const notification = await prisma.taskNotification.findFirst({
        where: {
            id: notificationId,
            userId
        }
    });

    if (!notification) {
        throw new BadUserInputError({
            message: 'Notification not found or unauthorized'
        });
    }

    return await prisma.taskNotification.delete({
        where: {
            id: notificationId
        }
    });
};

// Utility function to get location name from coordinates
const getLocationNameFromCoords = async (coords: string): Promise<string> => {
  try {
    const [lat, lng] = coords.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return coords;

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SchedSync-App/1.0'
        },
        timeout: 5000 // 5 second timeout
      }
    );

    // Check if we have a valid response with display_name
    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }

    return coords; // Return original coordinates if no valid location name
  } catch (error) {
    console.error('Error getting location name:', error);
    return coords; // Return original coordinates if there's an error
  }
};

export const sendLocationNotifications = async (userId: string, taskIds: string[]) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.email) {
        throw new Error("User not found or missing email");
      }

      // Fetch task details using the IDs
      const tasks = await prisma.task.findMany({
        where: {
          id: { in: taskIds },
        },
        select: {
          name: true,
          time: true,
          duration: true,
          location: true,
        },
      });

      // Get location names for all tasks
      const tasksWithLocationNames = await Promise.all(
        tasks.map(async (task) => {
          let locationName = task.location || "No location";

          // Only try to get location name if location exists and appears to be coordinates
          if (task.location && task.location.includes(',')) {
            locationName = await getLocationNameFromCoords(task.location);
          }

          return {
            ...task,
            locationName
          };
        })
      );

      // Format message with location names instead of coordinates
      const messageLines = tasksWithLocationNames.map((task, idx) => {
        return `${idx + 1}. ${task.name} \n   Time: ${new Date(task.time).toLocaleString()} \n   Duration: ${task.duration} min \n   Location: ${task.locationName}\n`;
      });

      const message = `📌 You have tasks nearby:\n\n${messageLines.join('\n')}\n\nThis notification was sent because you are near the location of these tasks.`;

      // Send email
      return await sendEmail(user.email, "Nearby Task Reminder", message);
  };