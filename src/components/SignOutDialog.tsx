import { motion } from 'framer-motion';
import Modal from './Modal';

export default function SignOutDialog({
  open,
  onConfirm,
  onClose,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="signout-title" panelClass="max-w-[340px]">
      <div className="p-5">
        <h2 id="signout-title" className="pr-6 text-[15px] font-bold text-[#F1EAF8]">
          Sign out?
        </h2>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#D9C6EA]/75">
          This clears the local Steam session state. Your Steam account and installed games are not affected.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="rounded-full border border-[rgba(217,198,234,0.14)] bg-[rgba(74,53,96,0.22)] px-4 py-1.5 text-[12px] font-medium text-[#D9C6EA]/85 transition-colors hover:text-[#F1EAF8]"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-[#8263A1] to-[#A07CC1] px-4 py-1.5 text-[12px] font-semibold text-[#F1EAF8]"
          >
            Sign Out
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
