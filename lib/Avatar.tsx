import Image from 'next/image'
import { User } from 'firebase/auth'

const Avatar = ({ user }: { user: User }) => {
    if (!user.photoURL) {
        return null;
    }
    return <Image
        className="rounded-full"
        src={user.photoURL}
        alt={user.displayName ?? "user icon"}
        width={32}
        height={32} />
}

export default Avatar
