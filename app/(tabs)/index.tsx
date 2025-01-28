import { useSession } from "@/hooks/useAuth";
import { firestore } from "@/lib/firebase";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { formatMood, formatTimestamp } from "@/lib/utils";
import { collection, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import React, { Fragment, useEffect, useState } from "react";
import { Dimensions, Image, PanResponder, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import GooseOMeterLogo from "../../assets/images/goose.svg";

const windowWidth = Dimensions.get("window").width;
const windowHeight = windowWidth;
const centerX = windowWidth / 2;
const centerY = windowHeight / 2;

// Constants for normalized coordinates
const MAX_COORDINATE = 100;

interface UserData {
  id: string;
  name: string;
  mood: { x: number; y: number };
  profileImage: string;
  updatedAt?: { nanoseconds: number; seconds: number };
}

export default function Grid() {
  const session = useSession();
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [geese, setGeese] = useState<UserData[]>([]);

  const userRef = session.user ? doc(firestore, "rooms", "RLHXAPTnHK9gMybwIh7F", "geese", session.user.uid) : null;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "rooms", "RLHXAPTnHK9gMybwIh7F", "geese"), (doc) => {
      const users = doc.docs.map((document) => ({ ...document.data(), id: document.id } as UserData));
      if (session.user !== null) {
        const userDetails = users.find((u) => u.id === session.user!.uid);
        if (userDetails) {
          setUserData(userDetails);
          setPosition(userDetails.mood ?? { x: 0, y: 0 });
        }
        setGeese(users);
      }
    });

    return () => unsubscribe();
  }, [session.user]);

  useEffect(() => {
    if (session.user) {
      registerForPushNotificationsAsync(session.user.uid);
    }
  }, [session.user]);

  // Convert screen coordinates to normalized coordinates (-100 to 100)
  const screenToNormalized = (screenX: number, screenY: number) => {
    const normalizedX = ((screenX - centerX) / centerX) * MAX_COORDINATE;
    const normalizedY = -((screenY - centerY) / centerY) * MAX_COORDINATE; // Invert Y for cartesian
    return {
      x: Math.max(-MAX_COORDINATE, Math.min(MAX_COORDINATE, normalizedX)),
      y: Math.max(-MAX_COORDINATE, Math.min(MAX_COORDINATE, normalizedY)),
    };
  };

  // Convert normalized coordinates to screen coordinates
  const normalizedToScreen = (x: number, y: number) => {
    return {
      left: centerX + (x * centerX) / MAX_COORDINATE - 15, // 15 is half the point size
      top: centerY - (y * centerY) / MAX_COORDINATE - 15,
    };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // When touch starts, immediately move point to touch location
      const normalized = screenToNormalized(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      setPosition(normalized);
    },
    onPanResponderMove: (evt) => {
      // During drag, update position
      const normalized = screenToNormalized(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      setPosition(normalized);
    },
    onPanResponderRelease: () => {
      if (userRef) {
        handleMoodUpdate();
        // setDoc(userRef, { mood: position, updatedAt: new Date() }, { merge: true });
      }
    },
  });

  const pointPosition = normalizedToScreen(position.x, position.y);

  const handleMoodUpdate = async () => {
    if (userRef && userData) {
      await setDoc(userRef, { mood: position, updatedAt: new Date() }, { merge: true });

      // Get all device tokens except the current user's
      const tokensSnapshot = await getDocs(collection(firestore, "tokens"));
      const tokens = tokensSnapshot.docs.filter((doc) => doc.id !== session.user?.uid).map((doc) => doc.data().token);

      // Send notification to all other users
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          tokens.map((token) => ({
            to: token,
            sound: "default",
            title: "Goose News",
            body: formatMood({ name: userData.name, mood: position }),
          }))
        ),
      });
    }
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.header}>
        <GooseOMeterLogo width={windowWidth} height={60} />
      </View>
      <View style={styles.container} {...panResponder.panHandlers}>
        {/* Grid lines container */}
        <View style={styles.gridContainer} pointerEvents="none">
          {/* Regular grid lines first */}
          {Array.from({ length: 21 }).map((_, i) => {
            const normalizedX = -100 + i * 10;
            if (normalizedX === 0) return null; // Skip axis
            return (
              <View
                key={`vertical-${i}`}
                style={[
                  styles.gridLine,
                  styles.verticalLine,
                  {
                    left: centerX + (normalizedX * centerX) / MAX_COORDINATE,
                    backgroundColor: "#eee",
                    width: 1,
                  },
                ]}
              />
            );
          })}

          {Array.from({ length: 21 }).map((_, i) => {
            const normalizedY = -100 + i * 10;
            if (normalizedY === 0) return null; // Skip axis
            return (
              <View
                key={`horizontal-${i}`}
                style={[
                  styles.gridLine,
                  styles.horizontalLine,
                  {
                    top: centerY - (normalizedY * centerY) / MAX_COORDINATE,
                    backgroundColor: "#eee",
                    height: 1,
                  },
                ]}
              />
            );
          })}

          {/* Axes on top */}
          <View
            style={[
              styles.gridLine,
              styles.verticalLine,
              {
                left: centerX,
                backgroundColor: "#666",
                width: 2,
                zIndex: 1,
              },
            ]}
          />
          <View
            style={[
              styles.gridLine,
              styles.horizontalLine,
              {
                top: centerY,
                backgroundColor: "#666",
                height: 2,
                zIndex: 1,
              },
            ]}
          />

          {/* Axis Labels */}
          <View style={[styles.axisLabelContainer, styles.rightLabel]}>
            <Text style={styles.axisLabelText}>silly</Text>
          </View>
          <View style={[styles.axisLabelContainer, styles.leftLabel]}>
            <Text style={styles.axisLabelText}>grumpy</Text>
          </View>
          <View style={[styles.axisLabelContainer, styles.topLabel]}>
            <Text style={styles.axisLabelText}>gripped</Text>
          </View>
          <View style={[styles.axisLabelContainer, styles.bottomLabel]}>
            <Text style={styles.axisLabelText}>ungripped</Text>
          </View>
        </View>

        {/* Point container */}
        <View style={[styles.point, pointPosition]} pointerEvents="none">
          <Image source={{ uri: userData?.profileImage }} style={styles.pointImage} />
        </View>
        {geese
          .filter((goose) => goose.id !== session.user?.uid)
          .map((goose) => (
            <View key={goose.id} style={[styles.point, normalizedToScreen(goose.mood.x, goose.mood.y)]} pointerEvents="none">
              <Image source={{ uri: goose.profileImage }} style={styles.pointImage} />
            </View>
          ))}
      </View>

      <View style={styles.userInfoContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {geese
            .filter((goose) => goose.updatedAt)
            .sort((a, b) => b.updatedAt!.seconds - a.updatedAt!.seconds)
            .map((goose, index) => (
              <Fragment key={goose.id}>
                <View style={[styles.userStatusItem, index !== 0 && styles.topBorder]}>
                  <Text style={styles.userInfoText}>{formatMood(goose)}</Text>
                  <Text style={styles.userInfoText}>{formatTimestamp(goose.updatedAt!)}</Text>
                </View>
              </Fragment>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#FFF6E5", // Warm cream background
  },
  header: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  container: {
    width: windowWidth,
    height: windowWidth,
    backgroundColor: "#FFF6E5", // Warm cream background
    position: "relative",
  },
  gridLine: {
    position: "absolute",
  },
  verticalLine: {
    width: 1,
    height: "100%",
  },
  horizontalLine: {
    width: "100%",
    height: 1,
  },
  point: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: "rgba(255, 124, 110, 0.5)", // Soft coral
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  pointImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  gridContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  userInfoContainer: {
    flex: 1,
    backgroundColor: "#E8D5C4", // Warm beige
    borderTopWidth: 1,
    borderTopColor: "#C3A6A0", // Muted rose
  },
  userInfoText: {
    fontSize: 16,
    marginVertical: 4,
    color: "#333",
    fontFamily: "ComicSans",
  },
  axisLabelContainer: {
    position: "absolute",
    backgroundColor: "rgba(167, 106, 97, 0.85)", // Vintage rose
    padding: 5,
    borderRadius: 4,
    zIndex: 2,
  },
  axisLabelText: {
    color: "white",
    fontSize: 14,
    fontFamily: "ComicSans",
  },
  rightLabel: {
    right: 10,
    top: centerY - 15,
  },
  leftLabel: {
    left: 10,
    top: centerY - 15,
  },
  topLabel: {
    top: 10,
    left: centerX - 30,
  },
  bottomLabel: {
    bottom: 10,
    left: centerX - 35,
  },
  userStatusItem: {
    paddingVertical: 8,
    marginHorizontal: 16,
  },
  topBorder: {
    borderTopWidth: 1,
    borderTopColor: "#C3A6A0", // Muted rose
  },
  scrollViewContent: {
    paddingBottom: 50,
  },
});
