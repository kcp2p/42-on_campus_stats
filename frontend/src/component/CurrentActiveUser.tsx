import React from "react";
import { Card, H1Style } from "../styles";
import { User } from "../../types";
import tw from "twin.macro";
import { getAllCurrentActiveUsers } from "../utils/service";

interface ICurrentActiveUserProps {
  className?: string;
}

const UserStyle = tw.div`
  flex flex-col items-center
  [> img]:(rounded-full h-10 w-10 object-cover)
  [> p]:(text-sm)
`;

const UserGalleryStyle = tw.div`
  grid grid-cols-5 gap-4 overflow-hidden scroll-smooth h-full basis-0 grow shrink
`;

const tmp = [
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },

  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
  { image: "", login: "random" },
];

function CurrentActiveUser({ className }: ICurrentActiveUserProps) {
  const [users, setUsers] = React.useState<User[]>([]);
  const divRef = React.useRef(null);

  React.useEffect(() => {
    const fetchUsers = async () => {
      await fetch(
        "https://backend-flask.onrender.com/api/on-campus/active-users"
      )
        .then((response) => {
          if (response.ok) {
            console.log("Successfully fetch Active Users Data");
            return response.json();
          }
        })
        .then((data) => setUsers(data))
        .catch((error) => {
          console.error(error);
        });
    };
    fetchUsers();

    // Call the API every 5 minutes
    const interval = setInterval(fetchUsers, 1000 * 60 * 5);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
    // setUsers(tmp);
  }, []);

  React.useEffect(() => {
    const div: any = divRef.current;
    const divHeight = div.scrollHeight;
    let scrollInt = 0;

    console.log("divHeight: ", divHeight);
    function updateScroll() {
      scrollInt += 1;
      if (scrollInt >= divHeight / 2) {
        scrollInt = -100;
        div.scrollTo({ left: 0, top: 0, behavior: "instant" });
        // div.scrollTop = 0;
      } else div.scrollTo(0, scrollInt);
    }
    const intervalId = setInterval(updateScroll, 100);
    return () => clearInterval(intervalId);
  }, [users]);

  const userGallery = tmp.map((singleUser) => {
    return (
      <UserStyle>
        <img src={singleUser.image} width={32} height={32} alt="" />
        <p>{singleUser.login}</p>
      </UserStyle>
    );
  });

  return (
    <Card className={className + " flex flex-col max-h-full"}>
      <H1Style>Current Active Users ({users.length})</H1Style>
      <UserGalleryStyle ref={divRef} id="user-gallery">
        {userGallery}
      </UserGalleryStyle>
    </Card>
  );
}

export default CurrentActiveUser;
